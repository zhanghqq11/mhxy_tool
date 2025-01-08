import React, { useState } from 'react';
import './App.css';

const factions = [
  "大唐官府",
  "化生寺",
  "龙宫",
  "方寸山",
  "女儿村",
  "狮驼岭",
  "阴曹地府",
  "普陀山",
  "盘丝洞",
  "天宫",
  "五庄观",
  "凌波城",
  "神木林",
  "魔王寨",
  "花果山",
  "无底洞",
  "天机城",
  "女魃墓",
  "东海渊",
  "九黎城"
];

function App() {
  const [selections, setSelections] = useState(Array(5).fill(''));
  const [inputs, setInputs] = useState(Array(5).fill(''));
  const [angerValues, setAngerValues] = useState(Array(5).fill(110));
  const [round, setRound] = useState(1);
  const [log, setLog] = useState([]);
  const [history, setHistory] = useState([{ round: 1, angerValues: Array(5).fill(110) }]);
  const [editRound, setEditRound] = useState('');
  const [editAngerValues, setEditAngerValues] = useState(Array(5).fill(110));

  const handleSelectChange = (index, event) => {
    const newSelections = [...selections];
    newSelections[index] = event.target.value;
    setSelections(newSelections);
  };

  const handleInputChange = (index, event) => {
    const value = event.target.value;
    if (/^[0-9+-]*$/.test(value)) { // 允许输入数字和 +、-
      const newInputs = [...inputs];
      newInputs[index] = value;
      setInputs(newInputs);
    }
  };

  const handleEditInputChange = (index, event) => {
    const value = event.target.value;
    if (/^-?\d*$/.test(value)) { // 仅允许输入数字和负号
      const newAngerValues = [...editAngerValues];
      newAngerValues[index] = value ? parseInt(value, 10) : 0;
      setEditAngerValues(newAngerValues);
    }
  };

  const handleRoundChange = (event) => {
    const value = event.target.value;
    if (/^\d*$/.test(value)) { // 仅允许输入数字
      setEditRound(value ? parseInt(value, 10) : '');
    }
  };

  const calculateAngerValue = (baseValue, expression) => {
    try {
      if (!expression) { // If the expression is empty, treat it as a +0
        return baseValue;
      }
      const result = expression.split(/(?=[+-])/).reduce((acc, curr) => acc + parseInt(curr, 10), baseValue);
      return Math.max(0, Math.min(150, result)); // Limit values between 0-150
    } catch (error) {
      return baseValue; // Return the base value if there's an error in evaluation
    }
  };

  const calculateAngerValues = () => {
    const previousAngerValues = history[history.length - 1].angerValues; // Get anger values from the last round
    const newAngerValues = inputs.map((value, index) => calculateAngerValue(previousAngerValues[index], value));

    // Save the current round state to ensure the backtracking operation can restore this state
    setHistory([...history, { round, angerValues: newAngerValues }]);

    // Update the log
    const newLogEntry = `回合数${round}: ` +
      inputs
        .map((value, index) => `${selections[index] || '未选择'} 愤怒值：${newAngerValues[index]}`)
        .join(' | ');

    setLog([...log, newLogEntry]);
    setAngerValues(newAngerValues);
    setRound(prevRound => prevRound + 1);
  };

  const undoLastRound = () => {
    if (round > 1) {
      const prevState = history[history.length - 2]; // Retrieve the state before the last round

      // Update state
      setRound(prevState.round);
      setAngerValues(prevState.angerValues); // Restore anger values
      setLog(log.slice(0, -1)); // Remove the latest log entry
      setHistory(history.slice(0, -1)); // Remove the last state from history
    }
  };

  const handleEditSubmit = () => {
    const newHistory = [...history];
    const newLog = [...log];

    for (let i = history.length; i < editRound; i++) {
      newHistory.push({ round: i + 1, angerValues: Array(5).fill(110) });
    }

    newHistory[editRound - 1] = { round: editRound, angerValues: editAngerValues };

    const newLogEntry = `回合数${editRound}: ` +
      editAngerValues
        .map((value, index) => `${selections[index] || '未选择'} 愤怒值：${value}`)
        .join(' | ');

    newLog[editRound - 1] = newLogEntry;

    setRound(editRound);
    setAngerValues(editAngerValues);
    setHistory(newHistory);
    setLog(newLog);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>回合数: {round}</h1>
        {[...Array(5)].map((_, index) => (
          <div key={index} className="selector-input-container">
            <label>
              门派选择 {index + 1}:
              <select
                className="selector"
                value={selections[index]}
                onChange={(event) => handleSelectChange(index, event)}
              >
                <option value="">--请选择--</option>
                {factions.map((faction, idx) => (
                  <option key={idx} value={faction}>
                    {faction}
                  </option>
                ))}
              </select>
              <input
                className="input"
                type="text"
                value={inputs[index]}
                onChange={(event) => handleInputChange(index, event)}
              />
              <span className="anger-value">愤怒值: {angerValues[index]}</span>
            </label>
          </div>
        ))}
        <div className="buttons-container">
          <button className="calculate-button" onClick={calculateAngerValues}>
            确定
          </button>
          <button className="undo-button" onClick={undoLastRound}>
            回退
          </button>
        </div>
        <textarea
          className="log-area"
          value={log.join('\n')}
          readOnly
        />
        <div className="edit-container">
          <h2>修改回合和愤怒值</h2>
          <label>
            回合:
            <input type="number" value={editRound} onChange={handleRoundChange} />
          </label>
          {[...Array(5)].map((_, index) => (
            <label key={index}>
              位置 {index + 1} 愤怒值:
              <input type="number" value={editAngerValues[index]} onChange={(event) => handleEditInputChange(index, event)} />
            </label>
          ))}
          <button className="edit-submit-button" onClick={handleEditSubmit}>
            提交修改
          </button>
        </div>
      </header>
    </div>
  );
}

export default App;