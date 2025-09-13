// 课程详情页面端到端测试
describe('课程详情页面测试', () => {
  beforeEach(() => {
    // 模拟钱包连接
    cy.mockWalletConnection();
    // 模拟课程详情数据
    cy.intercept('GET', '**/api/getCourse/*', {
      statusCode: 200,
      body: {
        id: '1',
        title: 'Web3 开发基础',
        description: '学习 Web3 开发的基础知识，包括区块链、智能合约等核心概念',
        content: '# Web3 开发基础\n\n## 课程简介\n\n本课程将带你深入了解 Web3 开发的核心概念和技术栈。\n\n## 学习目标\n\n- 理解区块链的基本原理\n- 掌握智能合约开发\n- 学习 DApp 开发\n- 了解 DeFi 协议\n\n## 课程内容\n\n### 第一章：区块链基础\n- 什么是区块链\n- 共识机制\n- 加密学基础\n\n### 第二章：智能合约\n- Solidity 语言\n- 合约部署\n- 合约交互\n\n### 第三章：前端开发\n- Web3.js\n- Ethers.js\n- 钱包连接\n\n## 结语\n\n通过本课程的学习，你将掌握 Web3 开发的核心技能。',
        price: '0.1',
        author: '0x1234567890123456789012345678901234567890',
        cover: 'https://via.placeholder.com/300x200',
        createdAt: '2024-01-01T00:00:00Z'
      }
    }).as('getCourse');
    
    // 访问课程详情页面
    cy.visit('/course/1');
  });

  it('应该正确显示课程详情', () => {
    cy.wait('@getCourse');
    
    // 检查课程标题
    cy.get('[data-testid="course-detail-title"]').should('contain', 'Web3 开发基础');
    
    // 检查课程描述
    cy.get('[data-testid="course-detail-description"]').should('contain', '学习 Web3 开发的基础知识');
    
    // 检查课程价格
    cy.get('[data-testid="course-detail-price"]').should('contain', '0.1 ETH');
    
    // 检查课程封面
    cy.get('[data-testid="course-detail-cover"]').should('be.visible');
  });

  it('应该正确渲染 Markdown 内容', () => {
    cy.wait('@getCourse');
    
    // 检查 Markdown 渲染
    cy.get('[data-testid="course-content"]').should('be.visible');
    cy.get('[data-testid="course-content"] h1').should('contain', 'Web3 开发基础');
    cy.get('[data-testid="course-content"] h2').should('contain', '课程简介');
    cy.get('[data-testid="course-content"] ul').should('be.visible');
    cy.get('[data-testid="course-content"] li').should('have.length.at.least', 4);
  });

  it('应该显示作者信息', () => {
    cy.wait('@getCourse');
    
    // 检查作者信息
    cy.get('[data-testid="course-author"]').should('be.visible');
    cy.get('[data-testid="course-author-address"]').should('contain', '0x1234...7890');
    cy.get('[data-testid="course-created-at"]').should('contain', '2024-01-01');
  });

  it('应该能够购买课程', () => {
    cy.wait('@getCourse');
    
    // 点击购买按钮
    cy.get('[data-testid="buy-course-btn"]').click();
    
    // 验证购买确认对话框
    cy.get('[data-testid="purchase-confirm-dialog"]').should('be.visible');
    cy.get('[data-testid="purchase-price"]').should('contain', '0.1 ETH');
    
    // 确认购买
    cy.get('[data-testid="confirm-purchase-btn"]').click();
    
    // 验证购买成功
    cy.get('[data-testid="purchase-success"]').should('be.visible');
  });

  it('应该能够取消购买', () => {
    cy.wait('@getCourse');
    
    // 点击购买按钮
    cy.get('[data-testid="buy-course-btn"]').click();
    
    // 验证购买确认对话框
    cy.get('[data-testid="purchase-confirm-dialog"]').should('be.visible');
    
    // 取消购买
    cy.get('[data-testid="cancel-purchase-btn"]').click();
    
    // 验证对话框关闭
    cy.get('[data-testid="purchase-confirm-dialog"]').should('not.exist');
  });

  it('应该显示课程统计信息', () => {
    cy.wait('@getCourse');
    
    // 检查统计信息
    cy.get('[data-testid="course-stats"]').should('be.visible');
    cy.get('[data-testid="course-students-count"]').should('be.visible');
    cy.get('[data-testid="course-rating"]').should('be.visible');
    cy.get('[data-testid="course-duration"]').should('be.visible');
  });

  it('应该能够返回课程列表', () => {
    cy.wait('@getCourse');
    
    // 点击返回按钮
    cy.get('[data-testid="back-to-courses-btn"]').click();
    
    // 验证返回课程列表
    cy.url().should('not.include', '/course/');
    cy.get('[data-testid="student-page"]').should('be.visible');
  });

  it('应该能够分享课程', () => {
    cy.wait('@getCourse');
    
    // 点击分享按钮
    cy.get('[data-testid="share-course-btn"]').click();
    
    // 验证分享选项
    cy.get('[data-testid="share-options"]').should('be.visible');
    cy.get('[data-testid="copy-link-btn"]').should('be.visible');
    cy.get('[data-testid="share-twitter-btn"]').should('be.visible');
  });

  it('应该处理课程不存在的情况', () => {
    // 访问不存在的课程
    cy.visit('/course/non-existent');
    
    // 验证错误页面
    cy.get('[data-testid="course-not-found"]').should('be.visible');
    cy.get('[data-testid="course-not-found"]').should('contain', '课程不存在');
  });
});
