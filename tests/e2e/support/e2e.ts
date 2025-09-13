// 端到端测试支持文件
// 在这里可以添加自定义命令和全局配置

// 自定义命令：模拟钱包连接
Cypress.Commands.add('mockWalletConnection', function () {
  // 模拟 MetaMask 钱包连接
  cy.window().then((win: any) => {
    (win as any).ethereum = {
      isMetaMask: true,
      request: Cypress.sinon.stub().resolves(['0x564E2E3C9069C9d0FC7DB4CB885238241468B293']),
      // 这里的 on 是模拟钱包事件监听的方法，通常用于监听账户变化、网络变化等事件
      // 这里用 Cypress.sinon.stub() 创建了一个假的（stub）方法，防止测试时出错
      on: Cypress.sinon.stub(),
      // 这里的 removeListener 是模拟钱包事件移除的方法，通常用于移除事件监听
      // 这里用 cy.stub() 创建了一个假的（stub）方法，防止测试时出错
      removeListener: cy.stub(),
    };
  });
});

// 自定义命令：等待页面加载完成
Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('body').should('be.visible');
  cy.get('[data-testid="loading"]', { timeout: 10000 }).should('not.exist');
});

// 自定义命令：模拟课程数据
Cypress.Commands.add('mockCourseData', () => {
  cy.intercept('GET', '**/api/getAllCourses', {
    statusCode: 200,
    body: [
      {
        id: '1',
        title: 'Web3 开发基础',
        description: '学习 Web3 开发的基础知识',
        content: '# Web3 开发基础\n\n这是一个关于 Web3 开发的课程...',
        price: '0.1',
        author: '0x1234567890123456789012345678901234567890',
        cover: 'https://via.placeholder.com/300x200',
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        title: '智能合约开发',
        description: '学习智能合约的开发技术',
        content: '# 智能合约开发\n\n这是一个关于智能合约开发的课程...',
        price: '0.2',
        author: '0x1234567890123456789012345678901234567890',
        cover: 'https://via.placeholder.com/300x200',
        createdAt: '2024-01-02T00:00:00Z'
      }
    ]
  }).as('getAllCourses');
});

// 扩展 Cypress 类型定义
export { }; // 确保这是一个模块，避免全局作用域报错

declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      mockWalletConnection(): Chainable<Subject>;
      waitForPageLoad(): Chainable<Subject>;
      mockCourseData(): Chainable<void>;
    }
  }
}
