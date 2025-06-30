describe('登录页面测试', () => {
  beforeEach(() => {
    cy.visit('/login')
    // 清除localStorage
    cy.clearLocalStorage()
  })

  it('页面加载完整性', () => {
    // 检查页面元素是否存在
    cy.get('input[placeholder="用户名"]').should('exist')
    cy.get('input[placeholder="密码"]').should('exist')
    cy.get('button').contains('登录').should('exist')
    cy.get('a').contains('立即注册').should('exist')
  })

  it('表单验证 - 必填字段', () => {
    cy.get('button').contains('登录').click()
    
    // 检查错误提示
    cy.get('.el-form-item__error').should('contain', '请输入用户名')
    cy.get('.el-form-item__error').should('contain', '请输入密码')
  })

  it('表单验证 - 密码长度', () => {
    cy.get('input[placeholder="密码"]').type('12345')
    cy.get('button').contains('登录').click()
    
    // 检查密码长度错误提示
    cy.get('.el-form-item__error').should('contain', '密码长度不能小于6位')
  })

  it('登录成功流程', () => {
    // 拦截登录API请求
    cy.intercept('POST', 'http://localhost:8000/api/users/login/', {
      statusCode: 200,
      body: {
        token: {
          access: 'mock-token'
        },
        user: {
          id: 1,
          username: 'hyle',
          email: 'test@example.com',
          phone: '13800138000'
        }
      }
    }).as('loginRequest')

    // 拦截其他API请求
    cy.intercept('GET', 'http://localhost:8000/api/users/profile/', {
      statusCode: 200,
      body: {
        id: 1,
        username: 'hyle',
        email: 'test@example.com',
        phone: '13800138000'
      }
    }).as('profileRequest')

    cy.intercept('GET', 'http://localhost:8000/api/guide-detail/guides/', {
      statusCode: 200,
      body: [{
        id: 1,
        title: '测试攻略1',
        content: '测试内容1',
        author: 'hyle',
        created_at: '2024-01-01T00:00:00Z'
      }]
    }).as('guidesRequest')

    // 拦截攻略广场API请求，使用通配符匹配查询参数
    cy.intercept('GET', 'http://localhost:8000/api/guide-square/guides/**', {
      statusCode: 200,
      body: [{
        id: 1,
        title: '测试攻略1',
        city: '北京',
        type: '美食',
        image: '/media/guide_images/test.jpg',
        description: '这是一篇测试攻略',
        author: {
          id: 1,
          username: 'hyle',
          avatar: '/media/avatars/test.jpg'
        },
        created_at: '2024-01-01T00:00:00Z',
        views: 100,
        rating: 4.5
      }]
    }).as('guideSquareRequest')

    // 输入正确的登录信息
    cy.get('input[placeholder="用户名"]').type('hyle')
    cy.get('input[placeholder="密码"]').type('chl12345678')
    
    // 点击登录按钮
    cy.get('button').contains('登录').click()

    // 等待登录请求完成
    cy.wait('@loginRequest')

    // 检查localStorage
    cy.window().its('localStorage.token').should('exist')
    cy.window().its('localStorage.username').should('equal', 'hyle')
    cy.window().its('localStorage.userInfo').should('exist')

    // 等待其他API请求完成
    cy.wait('@profileRequest')
    cy.wait('@guidesRequest')
    cy.wait('@guideSquareRequest')

    // 检查成功消息
    cy.get('.el-message--success').should('contain', '登录成功')

    // 检查是否跳转到首页
    cy.url().should('include', '/home')

    // 检查攻略广场内容加载
    cy.get('.guide-square-section').should('exist')
    cy.get('.square-guides-grid').should('exist')
    cy.get('.square-guide-card').should('have.length', 1)
    cy.get('.square-guide-card .guide-header h3').should('contain', '测试攻略1')
    cy.get('.square-guide-card .guide-city').should('contain', '北京')
    cy.get('.square-guide-card .guide-desc').should('contain', '这是一篇测试攻略')
    cy.get('.square-guide-card .guide-stats').should('contain', '100')
    cy.get('.square-guide-card .guide-stats').should('contain', '4.5')
  })

  it('登录失败处理 - 用户名或密码错误', () => {
    // 拦截登录API请求，模拟失败
    cy.intercept('POST', 'http://localhost:8000/api/users/login/', {
      statusCode: 400,
      body: {
        error: '用户名或密码错误'
      }
    }).as('loginRequest')

    // 输入错误的登录信息
    cy.get('input[placeholder="用户名"]').type('wronguser')
    cy.get('input[placeholder="密码"]').type('wrongpass')
    cy.get('button').contains('登录').click()

    // 等待API请求完成
    cy.wait('@loginRequest')

    // 检查错误提示
    cy.get('.el-message--error').should('contain', '用户名或密码错误')
  })

  it('登录失败处理 - 服务器连接错误', () => {
    // 拦截登录API请求，模拟网络错误
    cy.intercept('POST', 'http://localhost:8000/api/users/login/', {
      forceNetworkError: true
    }).as('loginRequest')

    // 输入登录信息
    cy.get('input[placeholder="用户名"]').type('hyle')
    cy.get('input[placeholder="密码"]').type('chl12345678')
    cy.get('button').contains('登录').click()

    // 等待API请求完成
    cy.wait('@loginRequest')

    // 检查错误提示
    cy.get('.el-message--error').should('contain', '无法连接到服务器，请检查网络连接')
  })
}) 