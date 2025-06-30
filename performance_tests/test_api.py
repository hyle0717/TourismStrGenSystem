# backend/performance_tests/test_api.py
from django.test import TestCase
from rest_framework.test import APIClient
import time
from .utils import TestDataGenerator, PerformanceMetrics
import os, json
from django.conf import settings

class APIPerformanceTest(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.metrics = PerformanceMetrics()
        cls.generator = TestDataGenerator()

    def setUp(self):
        self.client = APIClient()
        # 使用类属性 metrics 和 generator
        self.metrics = self.__class__.metrics
        self.generator = self.__class__.generator
        
        # 创建测试数据
        self.users = self.generator.create_test_users(100)
        self.plans = self.generator.create_test_plans(self.users, 1000)
        self.guides = self.generator.create_test_guides(self.users, 1000)
        
        # 登录测试用户
        self.test_user = self.users[0]
        self.client.force_authenticate(user=self.test_user)

    def test_api_response_time(self):
        """测试API响应时间"""
        # 测试旅游规划列表API
        start_time = time.time()
        response = self.client.get('/api/travel-planner/plan/')
        response_time = time.time() - start_time
        self.metrics.add_metric('api_performance', 'travel_plan_list_time', response_time)
        print(f"旅游规划列表API响应时间: {response_time}秒")
        
        # 测试攻略搜索API
        start_time = time.time()
        response = self.client.get('/api/guide-square/guides/?search=美食')
        search_time = time.time() - start_time
        self.metrics.add_metric('api_performance', 'guide_search_time', search_time)
        print(f"攻略搜索API响应时间: {search_time}秒")
        
        # 测试攻略详情API
        guide_id = self.guides[0].id
        start_time = time.time()
        response = self.client.get(f'/api/guide-square/guides/{guide_id}/')
        detail_time = time.time() - start_time
        self.metrics.add_metric('api_performance', 'guide_detail_time', detail_time)
        print(f"攻略详情API响应时间: {detail_time}秒")

    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        # 将本次测试的 API 性能写入 performance_results.json
        fn = os.path.join(settings.BASE_DIR, 'performance_results.json')
        if os.path.exists(fn):
            with open(fn, 'r') as f:
                data = json.load(f)
        else:
            data = {}
        data.update(cls.metrics.get_report())
        with open(fn, 'w') as f:
            json.dump(data, f, indent=4)