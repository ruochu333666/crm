import { useState } from "react";

function App() {
  // const [loading, setLoading] = useState(false);

//   const fetchData = async () => {
//     setLoading(true); // 开始加载
//     await fetch('https://api.example.com/data');
//     setLoading(false); // 加载结束
//   };

//   return (
//     <div>
//       {loading ? <p>正在加载...</p> : <button onClick={fetchData}>加载数据</button>}
//     </div>
//   );
const [text, setText] = useState('');



return (
  <div>
    <p>你输入的内容是：</p>
    <input 
    value={text}
    onChange={e => setText(e.target.value)}
    />
    <button onClick={() => setText('')}>清空</button>
    {/* <button onClick={() => setText()}>恢复</button> */}
  </div>
);

}

export default App;
