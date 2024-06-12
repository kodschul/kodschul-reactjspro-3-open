import { useEffect, useState } from "react";

const SlowComponent = () => {
  console.log("SlowComponent: Loading");

  const [items, setItems] = useState([]);

  const [isVisible, setVisible] = useState(true);

  useEffect(() => {
    let _items = [];
    for (let i = 0; i < 10; i++) {
      _items.push(i);
    }

    setItems(_items);
  }, []);

  return (
    <div>
      {isVisible && <div>SlowComponent</div>}

      <button onClick={() => setVisible(false)}>Toggle</button>

      {items.map((x) => {
        return (
          <div style={{ height: 100 }} key={x}>
            {x}
          </div>
        );
      })}
    </div>
  );
};

export default SlowComponent;
