describe('旅游攻略历史记录页面测试', () => {
  beforeEach(() => {
    // 访问历史记录页面前先模拟登录
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'mock-token')
    })
    cy.visit('/travel-history')
  })

  it('页面基础元素加载测试', () => {
    // 检查页面标题和返回按钮
    cy.get('.header-container h2').should('contain', '我的旅游攻略')
    cy.get('.back-button').should('exist')
    cy.get('.back-button').find('.el-icon').should('exist')
    
    // 检查标签页
    cy.get('.travel-tabs').should('be.visible')
    cy.get('.el-tabs__item').should('have.length', 2)
    cy.contains('.el-tabs__item', '我的攻略').should('exist')
    cy.contains('.el-tabs__item', '收藏的攻略').should('exist')
  })

  it('我的攻略列表加载测试', () => {
    // 模拟API响应
    cy.intercept('GET', '**/api/travel-planner/plan/', {
      fixture: 'travel-plans.json'
    }).as('getTravelPlans')

    // 等待API响应
    cy.wait('@getTravelPlans')

    // 检查表格列头
    cy.get('.el-tabs__content .el-tab-pane').first().within(() => {
      const myPlanHeaders = ['目的地', '行程天数', '预算', '出行日期', '特殊要求', '创建时间', '操作']
      
      // 检查每个具体的表头是否存在
      myPlanHeaders.forEach(header => {
        cy.contains('th', header).should('exist')
      })

      // 检查第一行数据
      cy.get('.el-table__body-wrapper tbody tr').first().within(() => {
        // 检查目的地
        cy.get('.el-table__cell').first().should('contain', '北京')
        
        // 检查操作按钮
        cy.get('button').should('have.length', 2)
        cy.get('button').first().should('contain', '查看攻略')
        cy.get('button').last().should('contain', '删除')
      })
    })
  })

  it('收藏攻略列表加载测试', () => {
    // 模拟API响应
    cy.intercept('GET', '**/api/guide-detail/collections/', {
      fixture: 'favorite-plans.json',
      delay: 100
    }).as('getFavoritePlans')

    // 切换到收藏的攻略标签
    cy.contains('.el-tabs__item', '收藏的攻略').click()

    // 等待API响应
    cy.wait('@getFavoritePlans')

    // 等待表格渲染完成并检查数据
    cy.get('.el-tabs__content .el-tab-pane').eq(1).within(() => {
      // 检查表格列头
      const favoriteHeaders = ['标题', '城市', '类型', '浏览量', '评分', '作者', '操作']
      favoriteHeaders.forEach(header => {
        cy.get('.el-table__header-wrapper').contains(header).should('be.visible')
      })

      // 检查表格数据
      cy.get('.el-table__body-wrapper').within(() => {
        // 检查是否有数据行
        cy.get('tr.el-table__row').should('have.length.at.least', 1)

        // 检查第一行数据
        cy.get('tr.el-table__row').first().within(() => {
          cy.contains('北京三日精华游').should('be.visible')
          cy.contains('北京').should('be.visible')
          cy.contains('文化游').should('be.visible')
          cy.get('button').contains('查看攻略').should('be.visible')
          cy.get('button').contains('取消收藏').should('be.visible')
        })
      })
    })
  })

  it('查看我的攻略详情测试', () => {
    // 模拟API响应
    cy.intercept('GET', '**/api/travel-planner/plan/', {
      fixture: 'travel-plans.json'
    }).as('getTravelPlans')

    // 等待数据加载
    cy.wait('@getTravelPlans')

    // 点击查看攻略按钮
    cy.contains('查看攻略').first().click()

    // 检查弹窗内容
    cy.get('.el-dialog').should('be.visible').within(() => {
      cy.get('.plan-info').should('exist')
      cy.get('.plan-info').within(() => {
        cy.contains('目的地').should('exist')
        cy.contains('行程天数').should('exist')
        cy.contains('预算').should('exist')
        cy.contains('出行日期').should('exist')
        cy.contains('旅行偏好').should('exist')
        cy.contains('特殊要求').should('exist')
      })
      cy.get('.plan-content').should('exist')
    })
  })

  it('查看收藏攻略详情测试', () => {
    // 模拟API响应
    cy.intercept('GET', '**/api/guide-detail/collections/', {
      fixture: 'favorite-plans.json'
    }).as('getFavoritePlans')

    cy.intercept('GET', '**/api/guide-detail/guides/*', {
      fixture: 'guide-detail.json'
    }).as('getGuideDetail')

    // 切换到收藏的攻略标签
    cy.contains('收藏的攻略').click()
    cy.wait('@getFavoritePlans')

    // 点击查看攻略按钮
    cy.contains('查看攻略').first().click()
    cy.wait('@getGuideDetail')

    // 检查弹窗内容
    cy.get('.el-dialog').should('be.visible').within(() => {
      cy.get('.guide-detail').should('exist')
      cy.get('.author-info').should('exist')
      cy.get('.guide-info').should('exist')
      cy.get('.guide-content').within(() => {
        cy.contains('攻略概要').should('exist')
        cy.contains('攻略详情').should('exist')
      })
    })
  })

  it('删除我的攻略测试', () => {
    // 模拟获取攻略列表的API响应
    cy.intercept('GET', '**/api/travel-planner/plan/', {
      fixture: 'travel-plans.json'
    }).as('getTravelPlans')

    // 模拟删除API响应
    cy.intercept('DELETE', '**/api/travel-planner/plan/*', {
      statusCode: 200
    }).as('deletePlan')

    // 等待初始数据加载
    cy.wait('@getTravelPlans')

    // 确保我们在"我的攻略"标签页
    cy.get('.el-tabs__content .el-tab-pane').first().within(() => {
      // 等待表格数据加载完成
      cy.get('.el-table__body-wrapper tbody tr')
        .should('have.length.at.least', 1)
        .first()
        .within(() => {
          // 点击删除按钮
          cy.get('button').contains('删除').should('be.visible').click()
        })
    })

    // 确认删除
    cy.get('.el-dialog')
      .should('be.visible')
      .within(() => {
        cy.contains('确定要删除这份旅游攻略吗？').should('be.visible')
        cy.contains('button', '确定删除').click()
      })

    // 等待删除请求完成
    cy.wait('@deletePlan')

    // 检查成功提示
    cy.get('.el-message').should('contain', '删除成功')

    // 等待列表重新加载
    cy.wait('@getTravelPlans')
  })

  it('取消收藏攻略测试', () => {
    // 模拟API响应
    cy.intercept('GET', '**/api/guide-detail/collections/', {
      fixture: 'favorite-plans.json'
    }).as('getFavoritePlans')

    cy.intercept('DELETE', '**/api/guide-detail/collections/*', {
      statusCode: 200
    }).as('cancelFavorite')

    // 切换到收藏的攻略标签
    cy.contains('收藏的攻略').click()
    cy.wait('@getFavoritePlans')

    // 点击取消收藏按钮
    cy.contains('取消收藏').first().click()

    // 确认取消收藏
    cy.get('.el-message-box').should('be.visible').within(() => {
      cy.contains('确定要取消收藏这份攻略吗？').should('exist')
      cy.contains('确定').click()
    })

    // 等待取消收藏请求完成
    cy.wait('@cancelFavorite')

    // 检查成功提示
    cy.get('.el-message').should('contain', '已取消收藏')
  })

  it('返回按钮功能测试', () => {
    // 点击返回按钮
    cy.get('.back-button').click()
    
    // 验证路由变化
    cy.url().should('not.include', '/travel-history')
  })
}) 