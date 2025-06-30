# backend/performance_tests/test_concurrency.py
import threading
import time
from django.test import TestCase
from rest_framework.test import APIClient
from .utils import TestDataGenerator, PerformanceMetrics
import os, json
from django.conf import settings

class ConcurrencyTest(TestCase):
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

    def test_concurrent_requests(self):
        """测试并发请求性能"""
        def make_request():
            self.client.get('/api/guide-square/guides/')
        
        # 创建100个并发请求
        threads = []
        start_time = time.time()
        
        for _ in range(100):
            thread = threading.Thread(target=make_request)
            threads.append(thread)
            thread.start()
        
        # 等待所有线程完成
        for thread in threads:
            thread.join()
            
        total_time = time.time() - start_time
        self.metrics.add_metric('concurrency', 'total_time', total_time)
        print(f"100个并发请求总耗时: {total_time}秒")
        
        # 计算TPS
        tps = 100 / total_time
        self.metrics.add_metric('concurrency', 'tps', tps)
        print(f"系统TPS: {tps}")

    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        # 将并发测试结果写入 performance_results.json
        fn = os.path.join(settings.BASE_DIR, 'performance_results.json')
        if os.path.exists(fn):
            with open(fn, 'r') as f:
                data = json.load(f)
        else:
            data = {}
        data.update(cls.metrics.get_report())
        with open(fn, 'w') as f:
            json.dump(data, f, indent=4)