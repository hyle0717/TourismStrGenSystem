from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import User
from .serializers import UserSerializer

class UserTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('users:register')
        self.login_url = reverse('users:login')
        self.profile_url = reverse('users:profile')
        self.change_password_url = reverse('users:change_password')
        
        # 测试用户数据
        self.user_data = {
            'username': 'testuser',
            'password': 'testpass123',
            'password2': 'testpass123',
            'email': 'test@example.com',
            'phone': '13800138000'
        }
        
        # 创建测试用户
        self.user = User.objects.create_user(
            username='admin',
            password='admin123',
            email='admin@example.com',
            phone='13900139000',
            is_staff=True
        )

    def test_user_registration(self):
        """测试用户注册功能"""
        response = self.client.post(self.register_url, self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)
        self.assertEqual(User.objects.count(), 2)

    def test_user_login(self):
        """测试用户登录功能"""
        # 先注册用户
        self.client.post(self.register_url, self.user_data, format='json')
        
        # 测试登录
        login_data = {
            'username': self.user_data['username'],
            'password': self.user_data['password']
        }
        response = self.client.post(self.login_url, login_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertIn('user', response.data)

    def test_user_profile(self):
        """测试用户个人信息获取和更新"""
        # 先登录
        self.client.force_authenticate(user=self.user)
        
        # 获取个人信息
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 更新个人信息
        update_data = {
            'phone': '13900139001'
        }
        response = self.client.patch(self.profile_url, update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['phone'], update_data['phone'])

    def test_change_password(self):
        """测试修改密码功能"""
        self.client.force_authenticate(user=self.user)
        
        change_password_data = {
            'old_password': 'admin123',
            'new_password': 'newpass123',
            'new_password2': 'newpass123'
        }
        response = self.client.post(self.change_password_url, change_password_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # 验证新密码是否生效
        self.assertTrue(self.user.check_password('newpass123'))
