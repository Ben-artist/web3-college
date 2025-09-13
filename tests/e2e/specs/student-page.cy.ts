// 学生页面端到端测试
describe('学生页面测试', () => {
  beforeEach(() => {
    // 模拟课程数据
    cy.mockCourseData();
    // 模拟钱包连接
    cy.mockWalletConnection();
    // 访问学生页面
    cy.visit('/');
  });

  it('应该正确显示页面标题和导航', () => {
    cy.get('h1').should('contain', 'Web3大学');
    cy.get('nav').should('be.visible');
    cy.get('[data-testid="student-tab"]').should('be.visible');
    cy.get('[data-testid="author-tab"]').should('be.visible');
  });

  it('应该正确显示课程列表', () => {
    cy.wait('@getAllCourses');
    
    // 检查课程卡片
    cy.get('[data-testid="course-card"]').should('have.length.at.least', 1);
    
    // 检查第一个课程的信息
    cy.get('[data-testid="course-card"]').first().within(() => {
      cy.get('[data-testid="course-title"]').should('contain', 'Web3 开发基础');
      cy.get('[data-testid="course-description"]').should('contain', '学习 Web3 开发的基础知识');
      cy.get('[data-testid="course-price"]').should('contain', '0.1 ETH');
      cy.get('[data-testid="course-cover"]').should('be.visible');
    });
  });

  it('应该能够点击课程查看详情', () => {
    cy.wait('@getAllCourses');
    
    // 点击第一个课程
    cy.get('[data-testid="course-card"]').first().click();
    
    // 验证跳转到课程详情页
    cy.url().should('include', '/course/');
    
    // 检查课程详情内容
    cy.get('[data-testid="course-detail-title"]').should('contain', 'Web3 开发基础');
    cy.get('[data-testid="course-detail-content"]').should('be.visible');
    cy.get('[data-testid="course-detail-price"]').should('contain', '0.1 ETH');
  });

  it('应该能够搜索课程', () => {
    cy.wait('@getAllCourses');
    
    // 在搜索框中输入关键词
    cy.get('[data-testid="search-input"]').type('智能合约');
    
    // 验证搜索结果
    cy.get('[data-testid="course-card"]').should('have.length.at.least', 1);
    cy.get('[data-testid="course-card"]').first().should('contain', '智能合约');
  });

  it('应该能够切换页面标签', () => {
    // 点击作者标签
    cy.get('[data-testid="author-tab"]').click();
    
    // 验证跳转到作者页面
    cy.url().should('include', '/author');
    cy.get('[data-testid="author-page"]').should('be.visible');
    
    // 点击学生标签
    cy.get('[data-testid="student-tab"]').click();
    
    // 验证跳转回学生页面
    cy.url().should('include', '/');
    cy.get('[data-testid="student-page"]').should('be.visible');
  });

  it('应该能够连接钱包', () => {
    // 点击连接钱包按钮
    cy.get('[data-testid="connect-wallet-btn"]').click();
    
    // 验证钱包连接状态
    cy.get('[data-testid="wallet-connected"]').should('be.visible');
    cy.get('[data-testid="wallet-address"]').should('contain', '0x1234...7890');
    cy.get('[data-testid="wallet-balance"]').should('contain', '1.5 ETH');
  });

  it('应该能够断开钱包连接', () => {
    // 先连接钱包
    cy.get('[data-testid="connect-wallet-btn"]').click();
    cy.get('[data-testid="wallet-connected"]').should('be.visible');
    
    // 断开钱包连接
    cy.get('[data-testid="disconnect-wallet-btn"]').click();
    
    // 验证钱包已断开
    cy.get('[data-testid="connect-wallet-btn"]').should('be.visible');
    cy.get('[data-testid="wallet-connected"]').should('not.exist');
  });
});
