import { MainLayout } from "../../components/MainLayout";
import styles from "./index.module.less";

function HomePage() {
  return (
    <MainLayout>
      <div className={styles.homeContent}>
        <div className={styles.welcomeSection}>
          <h1 className={styles.title}>欢迎回来！</h1>
          <p className={styles.subtitle}>
            这是你的个人工作台，在这里你可以管理你的项目和任务。
          </p>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📊</div>
            <div className={styles.statContent}>
              <h3>数据统计</h3>
              <p>查看你的数据概览</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>📝</div>
            <div className={styles.statContent}>
              <h3>任务管理</h3>
              <p>管理你的待办事项</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>👥</div>
            <div className={styles.statContent}>
              <h3>团队协作</h3>
              <p>与团队成员协作</p>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon}>⚙️</div>
            <div className={styles.statContent}>
              <h3>系统设置</h3>
              <p>个性化你的体验</p>
            </div>
          </div>
        </div>

        <div className={styles.recentActivity}>
          <h2>最近活动</h2>
          <div className={styles.activityList}>
            <div className={styles.activityItem}>
              <div className={styles.activityIcon}>✅</div>
              <div className={styles.activityContent}>
                <p>完成了项目设置</p>
                <span>2小时前</span>
              </div>
            </div>
            <div className={styles.activityItem}>
              <div className={styles.activityIcon}>📁</div>
              <div className={styles.activityContent}>
                <p>创建了新文件夹</p>
                <span>1天前</span>
              </div>
            </div>
            <div className={styles.activityItem}>
              <div className={styles.activityIcon}>👤</div>
              <div className={styles.activityContent}>
                <p>更新了个人资料</p>
                <span>3天前</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default HomePage;
