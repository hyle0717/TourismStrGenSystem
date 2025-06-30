# backend/performance_tests/test_database.py
from django.test import TestCase
from django.db import connection
import time
from .utils import TestDataGenerator, PerformanceMetrics
from travel_planner.models import TravelPlan
from guide_square.models import Guide
import os, json
from django.conf import settings

class DatabasePerformanceTest(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.metrics = PerformanceMetrics()
        cls.generator = TestDataGenerator()

    def setUp(self):
        # 创建测试数据
        print("开始创建测试数据...")
        self.users = self.generator.create_test_users(100)
        self.plans = self.generator.create_test_plans(self.users, 1000)
        self.guides = self.generator.create_test_guides(self.users, 1000)
        print("测试数据创建完成")

    def test_query_performance(self):
        """测试查询性能"""
        # 测试旅游规划列表查询（使用 perf_counter 和 list 强制执行）
        start_time = time.perf_counter()
        plans = list(TravelPlan.objects.all())
        query_time = time.perf_counter() - start_time
        self.metrics.add_metric('query_performance', 'basic_query_time', query_time)
        print(f"查询1000条旅游规划耗时: {query_time:.6f}秒")
        
        # 测试带过滤的查询（强制执行）
        start_time = time.perf_counter()
        filtered_plans = list(TravelPlan.objects.filter(destination='上海'))
        filter_time = time.perf_counter() - start_time
        self.metrics.add_metric('query_performance', 'filtered_query_time', filter_time)
        print(f"带过滤条件查询耗时: {filter_time:.6f}秒")
        
        # 测试关联查询（强制执行）
        start_time = time.perf_counter()
        guides = list(Guide.objects.select_related('author').all())
        join_time = time.perf_counter() - start_time
        self.metrics.add_metric('query_performance', 'join_query_time', join_time)
        print(f"关联查询耗时: {join_time:.6f}秒")
        
        # 测试复杂查询（强制执行）
        start_time = time.perf_counter()
        complex_list = list(
            Guide.objects.filter(city='上海', type='美食')
                .select_related('author')
                .order_by('-views')
        )
        complex_time = time.perf_counter() - start_time
        self.metrics.add_metric('query_performance', 'complex_query_time', complex_time)
        print(f"复杂查询耗时: {complex_time:.6f}秒")

    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        # 将本次测试的 metrics 写入 performance_results.json
        fn = os.path.join(settings.BASE_DIR, 'performance_results.json')
        if os.path.exists(fn):
            with open(fn, 'r') as f:
                data = json.load(f)
        else:
            data = {}
        data.update(cls.metrics.get_report())
        with open(fn, 'w') as f:
            json.dump(data, f, indent=4)