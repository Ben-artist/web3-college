/**
 * 前端集成示例
 * 展示如何在React应用中使用Cloudflare Workers API
 */

// Workers API 基础URL
const WORKERS_BASE_URL = 'https://web3-college-workers.your-subdomain.workers.dev';

/**
 * Workers API 服务类
 */
class WorkersAPIService {
  /**
   * 创建课程
   */
  static async createCourse(address, courseId, content, title, cost) {
    try {
      const response = await fetch(`${WORKERS_BASE_URL}/api/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          courseId,
          content,
          title,
          cost
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('创建课程失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户创建的课程
   */
  static async getUserCourses(address) {
    try {
      const response = await fetch(`${WORKERS_BASE_URL}/api/courses/${address}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('获取用户课程失败:', error);
      throw error;
    }
  }

  /**
   * 记录课程购买
   */
  static async recordPurchase(courseId, creator, buyer, title, cost) {
    try {
      const response = await fetch(`${WORKERS_BASE_URL}/api/purchases`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          creator,
          buyer,
          title,
          cost
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('记录购买失败:', error);
      throw error;
    }
  }

  /**
   * 获取课程购买记录
   */
  static async getCoursePurchases(courseId) {
    try {
      const response = await fetch(`${WORKERS_BASE_URL}/api/purchases/${courseId}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('获取课程购买记录失败:', error);
      throw error;
    }
  }

  /**
   * 健康检查
   */
  static async healthCheck() {
    try {
      const response = await fetch(`${WORKERS_BASE_URL}/api/health`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('健康检查失败:', error);
      throw error;
    }
  }
}

// 导出服务类
export { WorkersAPIService };
