import { Button, message } from "antd";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "../../components/MainLayout";
import { apiRequest } from "../../api/http";
import { followupsApi } from "../../api/followups";
import type { TaskItem } from "../../api/types";
import ReactECharts from "echarts-for-react";
import styles from "./index.module.less";

function HomePage() {
  const navigate = useNavigate();
  const statsSectionRef = useRef<HTMLDivElement | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [taskTrend, setTaskTrend] = useState<
    { date: string; completedTasks: number }[]
  >([]);
  const [followupTrend, setFollowupTrend] = useState<
    { date: string; followups: number }[]
  >([]);
  const [poolSummary, setPoolSummary] = useState<
    { action: string; count: number }[]
  >([]);
  const [loadingStats, setLoadingStats] = useState(false);

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

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoadingStats(true);
        const dashboardRes = await apiRequest("/stats/dashboard?range=7");
        if (!dashboardRes.ok) {
          const error = await dashboardRes.json();
          throw new Error(error.message || "加载统计失败");
        }
        const dashboardJson = await dashboardRes.json();
        setTaskTrend(dashboardJson.taskTrend || []);
        setFollowupTrend(dashboardJson.followupTrend || []);

        const poolRes = await apiRequest("/stats/pool?range=30");
        if (!poolRes.ok) {
          const error = await poolRes.json();
          throw new Error(error.message || "加载公海统计失败");
        }
        const poolJson = await poolRes.json();
        setPoolSummary(poolJson.summary || []);
      } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : "加载统计失败";
        console.error("[HomePage] 加载统计失败:", error);
        message.error(errMsg);
      } finally {
        setLoadingStats(false);
      }
    };
    void loadStats();
  }, []);

  const dateSet = new Set<string>();
  for (const r of taskTrend) dateSet.add(String(r.date));
  for (const r of followupTrend) dateSet.add(String(r.date));
  const dates = Array.from(dateSet).sort();

  const completedTasksByDate = new Map<string, number>(
    taskTrend.map((r) => [String(r.date), Number(r.completedTasks || 0)])
  );
  const followupsByDate = new Map<string, number>(
    followupTrend.map((r) => [String(r.date), Number(r.followups || 0)])
  );

  const taskOption = {
    tooltip: { trigger: "axis" },
    legend: { data: ["完成任务", "跟进次数"] },
    xAxis: { type: "category", data: dates },
    yAxis: { type: "value" },
    series: [
      {
        name: "完成任务",
        type: "line",
        smooth: true,
        data: dates.map((d) => completedTasksByDate.get(d) || 0),
      },
      {
        name: "跟进次数",
        type: "line",
        smooth: true,
        data: dates.map((d) => followupsByDate.get(d) || 0),
      },
    ],
  };

  const actionNameMap: Record<string, string> = {
    to_pool: "入池",
    take: "捞取",
    recycle: "回收",
  };

  const poolOption = {
    tooltip: { trigger: "item" },
    legend: { bottom: 0 },
    series: [
      {
        type: "pie",
        radius: "60%",
        data: poolSummary.map((x) => ({
          name: actionNameMap[String(x.action)] || String(x.action),
          value: Number(x.count || 0),
        })),
      },
    ],
  };

  const scrollToStatsSection = () => {
    statsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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
          <div className={styles.statCard} onClick={scrollToStatsSection}>
            <div className={styles.statIcon}>📊</div>
            <div className={styles.statContent}>
              <h3>数据统计</h3>
              <p>查看你的数据概览</p>
            </div>
          </div>

          <div className={styles.statCard} onClick={() => navigate("/task")}>
            <div className={styles.statIcon}>📝</div>
            <div className={styles.statContent}>
              <h3>任务管理</h3>
              <p>管理你的待办事项</p>
            </div>
          </div>

          <div className={styles.statCard} onClick={() => navigate("/opportunities")}>
            <div className={styles.statIcon}>👥</div>
            <div className={styles.statContent}>
              <h3>团队协作</h3>
              <p>与团队成员协作</p>
            </div>
          </div>

          <div className={styles.statCard} onClick={() => navigate("/settings")}>
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

        <div className={styles.recentActivity} ref={statsSectionRef}>
          <h2>任务 & 跟进趋势（7天）</h2>
          <div style={{ height: 320 }}>
            <ReactECharts option={taskOption} style={{ height: "100%" }} />
          </div>
          {loadingStats ? (
            <div style={{ marginTop: 8, color: "#888" }}>统计加载中...</div>
          ) : null}
        </div>

        <div className={styles.recentActivity}>
          <h2>公海运营结构（30天）</h2>
          <div style={{ height: 320 }}>
            <ReactECharts option={poolOption} style={{ height: "100%" }} />
          </div>
          {loadingStats ? (
            <div style={{ marginTop: 8, color: "#888" }}>统计加载中...</div>
          ) : null}
        </div>
      </div>
    </MainLayout>
  );
}

export default HomePage;
