import { Button, message } from "antd";
import { useEffect, useState } from "react";
import { MainLayout } from "../../components/MainLayout";
import { followupsApi } from "../../api/followups";
import type { TaskItem } from "../../api/types";
import styles from "./index.module.less";

function HomePage() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);

  const loadTasks = async () => {
    try {
      setLoadingTasks(true);
      const dueTo = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const res = await followupsApi.getTasks({
        status: "open",
        dueTo,
        limit: 20,
      });
      setTasks(res.data);
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "加载待办失败";
      console.error("[HomePage] 加载待办失败:", error);
      message.error(errMsg);
    } finally {
      setLoadingTasks(false);
    }
  };

  const handleDone = async (taskId: number) => {
    try {
      await followupsApi.updateTaskStatus(taskId, "done");
      message.success("任务已完成");
      await loadTasks();
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "更新任务失败";
      console.error("[HomePage] 更新任务失败:", error);
      message.error(errMsg);
    }
  };

  useEffect(() => {
    void loadTasks();
  }, []);

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
          <h2>我的待办（7天内）</h2>
          <div className={styles.activityList}>
            {tasks.length === 0 ? (
              <div className={styles.activityItem}>
                <div className={styles.activityIcon}>{loadingTasks ? "⏳" : "✅"}</div>
                <div className={styles.activityContent}>
                  <p>{loadingTasks ? "待办加载中..." : "暂无待办任务"}</p>
                  <span>你可以在客户详情里新增跟进记录并设置下次跟进时间</span>
                </div>
              </div>
            ) : (
              tasks.map((task) => (
                <div className={styles.activityItem} key={task.id}>
                  <div className={styles.activityIcon}>📌</div>
                  <div className={styles.activityContent}>
                    <p>
                      {task.title}
                      {task.customer_name ? ` - ${task.customer_name}` : ""}
                    </p>
                    <span>截止时间：{String(task.due_at).replace("T", " ").slice(0, 19)}</span>
                  </div>
                  <Button size="small" onClick={() => void handleDone(task.id)}>
                    完成
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default HomePage;
