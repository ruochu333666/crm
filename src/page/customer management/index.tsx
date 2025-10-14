import styles from "./index.module.less";

function CustomerManagementPage() {
  return (
    <div className={styles.customerManagementContainer}>
      <div className={styles.customerManagementCard}>
        <div className={styles.title}>客户管理</div>
      </div>
    </div>
  );
}
export default CustomerManagementPage;
