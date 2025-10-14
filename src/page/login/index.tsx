import { Button, Checkbox, Form, Input, message } from "antd";
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authApi } from "../../api/auth";
import { useAuthStore } from "../../store/auth";
import styles from "./index.module.less";

type FieldType = {
  username?: string;
  password?: string;
  remember?: string;
};

function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const response = await authApi.login({
        username: values.username,
        password: values.password,
      });

      // 使用状态管理保存登录信息
      login(response.token, response.user);

      message.success("登录成功！");
      console.log("登录成功:", response);

      // 跳转到原来要访问的页面，或主页
      const from = location.state?.from?.pathname || "/home";
      navigate(from, { replace: true });
    } catch (error: any) {
      message.error(error.message || "登录失败");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.decorativeElement}></div>
        <div className={styles.decorativeElement2}></div>

        <div className={styles.title}>贸易管理系统</div>
        <div className={styles.subtitle}>客户关系管理平台</div>

        <div className={styles.formContainer}>
          <Form
            name="basic"
            layout="vertical"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item<FieldType>
              label="用户名"
              name="username"
              className={styles.formItem}
              rules={[{ required: true, message: "请输入用户名!" }]}
            >
              <Input placeholder="请输入用户名" />
            </Form.Item>

            <Form.Item<FieldType>
              label="密码"
              name="password"
              className={styles.formItem}
              rules={[{ required: true, message: "请输入密码!" }]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>

            <Form.Item<FieldType>
              name="remember"
              valuePropName="checked"
              className={styles.rememberMe}
            >
              <Checkbox>记住我</Checkbox>
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className={styles.submitButton}
                loading={loading}
                block
              >
                登录
              </Button>
            </Form.Item>

            <div className={styles.registerLink}>
              还没有账户？<Link to="/register">立即注册</Link>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
