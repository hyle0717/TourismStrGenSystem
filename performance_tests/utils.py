import time
from django.core.files.uploadedfile import SimpleUploadedFile
from users.models import User
from travel_planner.models import TravelPlan
from guide_square.models import Guide
from guide_detail.models import TravelGuide
import random

class TestDataGenerator:
    @staticmethod
    def create_test_users(count=100):
        """创建测试用户"""
        users = []
        for i in range(count):
            user = User.objects.create_user(
                username=f'testuser{i}',
                password='testpass123',
                email=f'test{i}@example.com',
                phone=f'1380013{i:04d}'
            )
            users.append(user)
        return users

    @staticmethod
    def create_test_plans(users, count=1000):
        """创建测试旅游规划"""
        destinations = ['上海', '北京', '广州', '深圳', '杭州']
        preferences = ['文化', '美食', '购物', '自然风光', '历史古迹']
        
        plans = []
        for i in range(count):
            plan = TravelPlan.objects.create(
                user=random.choice(users),
                destination=random.choice(destinations),
                duration=random.randint(1, 7),
                budget=random.randint(1000, 10000),
                travel_date='2024-04-01',
                preferences=random.sample(preferences, 2),
                special_requirements=f'测试要求{i}'
            )
            plans.append(plan)
        return plans

    @staticmethod
    def create_test_guides(users, count=1000):
        """创建测试攻略"""
        cities = ['上海', '北京', '广州', '深圳', '杭州']
        types = ['美食', '景点', '文化', '购物', '休闲', '度假']
        
        # 创建测试图片
        image = SimpleUploadedFile(
            name='test_image.jpg',
            content=b'',
            content_type='image/jpeg'
        )
        
        guides = []
        for i in range(count):
            guide = Guide.objects.create(
                title=f'测试攻略{i}',
                description=f'这是测试攻略{i}的描述',
                city=random.choice(cities),
                type=random.choice(types),
                image=image,
                author=random.choice(users),
                views=random.randint(0, 1000),
                rating=random.uniform(1, 5)
            )
            guides.append(guide)
        return guides

class PerformanceMetrics:
    def __init__(self):
        self.metrics = {}
    
    def add_metric(self, test_name, metric_name, value):
        if test_name not in self.metrics:
            self.metrics[test_name] = {}
        self.metrics[test_name][metric_name] = value
    
    def get_report(self):
        return self.metrics
