import { Button, Modal, Select, Space, Tag, message } from "antd";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "../../components/MainLayout";
import { apiRequest } from "../../api/http";
import { followupsApi } from "../../api/followups";
import type { TaskItem } from "../../api/types";
import type { Customer } from "../../api/customers";
import { customersApi } from "../../api/customers";
import { aiApi, type CustomerNextStepAdvice } from "../../api/ai";
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
  const [aiVisible, setAiVisible] = useState(false);
  const [aiAdviceLoading, setAiAdviceLoading] = useState(false);
  const [aiCustomers, setAiCustomers] = useState<Customer[]>([]);
  const [aiCustomerId, setAiCustomerId] = useState<number | undefined>(undefined);
  const [aiAdvice, setAiAdvice] = useState<CustomerNextStepAdvice | null>(null);

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

  const loadAiCustomers = async () => {
    try {
      const res = await customersApi.getList({ page: 1, pageSize: 200 });
      setAiCustomers(res.data);
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "加载客户失败";
      console.error("[HomePage] AI入口加载客户失败:", error);
      message.error(errMsg);
    }
  };

  const openAiModal = async () => {
    setAiVisible(true);
    setAiAdvice(null);
    if (aiCustomers.length === 0) {
      await loadAiCustomers();
    }
  };

  const handleGenerateAdvice = async () => {
    if (!aiCustomerId) {
      message.warning("请先选择客户");
      return;
    }
    try {
      setAiAdviceLoading(true);
      const res = await aiApi.getCustomerNextStep(aiCustomerId);
      setAiAdvice(res.data);
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "获取AI建议失败";
      console.error("[HomePage] 获取AI建议失败:", error);
      message.error(errMsg);
    } finally {
      setAiAdviceLoading(false);
    }
  };

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

          <div className={styles.statCard} onClick={() => void openAiModal()}>
            <div className={styles.statIcon}>🤖</div>
            <div className={styles.statContent}>
              <h3>AI销售助手</h3>
              <p>首页直接生成客户下一步建议</p>
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

        <Modal
          title="AI销售助手"
          open={aiVisible}
          onCancel={() => setAiVisible(false)}
          footer={
            <Space>
              <Button onClick={() => setAiVisible(false)}>关闭</Button>
              <Button type="primary" loading={aiAdviceLoading} onClick={() => void handleGenerateAdvice()}>
                生成建议
              </Button>
            </Space>
          }
          width={720}
        >
          <Space direction="vertical" style={{ width: "100%" }} size="middle">
            <Select
              showSearch
              placeholder="请选择客户"
              optionFilterProp="label"
              value={aiCustomerId}
              onChange={(v) => setAiCustomerId(v)}
              options={aiCustomers.map((c) => ({
                label: `${c.name}（${c.contact}）`,
                value: c.id as number,
              }))}
            />
            {aiAdvice ? (
              <Space direction="vertical" style={{ width: "100%" }} size="small">
                <div>
                  <strong>客户现状总结</strong>
                  <p>{aiAdvice.summary}</p>
                </div>
                <div>
                  <strong>下一步动作建议</strong>
                  <p>{aiAdvice.nextAction}</p>
                </div>
                <div>
                  <strong>建议话术</strong>
                  <p>{aiAdvice.talkTrack}</p>
                </div>
                <div>
                  <strong>风险等级</strong>{" "}
                  <Tag
                    color={
                      aiAdvice.riskLevel === "high"
                        ? "red"
                        : aiAdvice.riskLevel === "medium"
                          ? "orange"
                          : "green"
                    }
                  >
                    {aiAdvice.riskLevel}
                  </Tag>
                </div>
              </Space>
            ) : (
              <div style={{ color: "#888" }}>选择客户后点击“生成建议”</div>
            )}
          </Space>
        </Modal>
      </div>
    </MainLayout>
  );
}

export default HomePage;
