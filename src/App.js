import { useReducer, useEffect } from "react"
import DigitButton from "./DigitButton"
import OperationButton from "./OperationButton"
import "./styles.css"

export const ACTIONS = {
  ADD_DIGIT: "add-digit",
  CHOOSE_OPERATION: "choose-operation",
  CLEAR: "clear",
  DELETE_DIGIT: "delete-digit",
  EVALUATE: "evaluate",
}

function reducer(state, { type, payload }) {
  switch (type) {
    case ACTIONS.ADD_DIGIT:
      if (state.overwrite) {
        return { ...state, currentOperand: payload.digit, overwrite: false }
      }
      if (payload.digit === "0" && state.currentOperand === "0") return state
      if (payload.digit === "." && state.currentOperand?.includes(".")) return state
      return {
        ...state,
        currentOperand: `${state.currentOperand || ""}${payload.digit}`,
      }

    case ACTIONS.CHOOSE_OPERATION:
      if (["√", "x²", "1/x", "%"].includes(payload.operation)) {
        if (state.currentOperand == null) return state
        return {
          ...state,
          currentOperand: evaluateUnary(state.currentOperand, payload.operation),
          overwrite: true,
        }
      }

      if (state.currentOperand == null && state.previousOperand == null) return state

      if (state.currentOperand == null) {
        return { ...state, operation: payload.operation }
      }

      if (state.previousOperand == null) {
        return {
          ...state,
          operation: payload.operation,
          previousOperand: state.currentOperand,
          currentOperand: null,
        }
      }

      return {
        ...state,
        previousOperand: evaluate(state),
        operation: payload.operation,
        currentOperand: null,
      }

    case ACTIONS.CLEAR:
      return {}

    case ACTIONS.DELETE_DIGIT:
      if (state.overwrite) {
        return { ...state, overwrite: false, currentOperand: null }
      }
      if (state.currentOperand == null) return state
      if (state.currentOperand.length === 1) return { ...state, currentOperand: null }
      return { ...state, currentOperand: state.currentOperand.slice(0, -1) }

    case ACTIONS.EVALUATE:
      if (state.operation == null || state.currentOperand == null || state.previousOperand == null) {
        return state
      }
      return {
        ...state,
        overwrite: true,
        previousOperand: null,
        operation: null,
        currentOperand: evaluate(state),
      }

    default:
      return state
  }
}

function evaluate({ currentOperand, previousOperand, operation }) {
  const prev = parseFloat(previousOperand)
  const current = parseFloat(currentOperand)
  if (isNaN(prev) || isNaN(current)) return ""
  let computation = ""
  switch (operation) {
    case "+": computation = prev + current; break
    case "-": computation = prev - current; break
    case "*": computation = prev * current; break
    case "÷": computation = prev / current; break
    case "^": computation = Math.pow(prev, current); break
    default: return ""
  }
  return computation.toString()
}

function evaluateUnary(value, operation) {
  const num = parseFloat(value)
  if (isNaN(num)) return ""
  switch (operation) {
    case "√": return Math.sqrt(num).toString()
    case "x²": return Math.pow(num, 2).toString()
    case "1/x": return (1 / num).toString()
    case "%": return (num / 100).toString()
    default: return value
  }
}

const INTEGER_FORMATTER = new Intl.NumberFormat("en-us", { maximumFractionDigits: 0 })
function formatOperand(operand) {
  if (operand == null) return
  const [integer, decimal] = operand.split(".")
  if (decimal == null) return INTEGER_FORMATTER.format(integer)
  return `${INTEGER_FORMATTER.format(integer)}.${decimal}`
}

function App() {
  const [{ currentOperand, previousOperand, operation }, dispatch] = useReducer(reducer, {})

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (/\d/.test(e.key)) {
        dispatch({ type: ACTIONS.ADD_DIGIT, payload: { digit: e.key } })
      } else if (e.key === ".") {
        dispatch({ type: ACTIONS.ADD_DIGIT, payload: { digit: "." } })
      } else if (["+", "-", "*", "/", "^"].includes(e.key)) {
        dispatch({
          type: ACTIONS.CHOOSE_OPERATION,
          payload: { operation: e.key === "/" ? "÷" : e.key },
        })
      } else if (e.key === "Enter" || e.key === "=") {
        dispatch({ type: ACTIONS.EVALUATE })
      } else if (e.key === "Backspace") {
        dispatch({ type: ACTIONS.DELETE_DIGIT })
      } else if (e.key.toLowerCase() === "c") {
        dispatch({ type: ACTIONS.CLEAR })
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <div className="calculator-grid">
      <div className="output">
        <div className="previous-operand">
          {formatOperand(previousOperand)} {operation}
        </div>
        <div className="current-operand">{formatOperand(currentOperand)}</div>
      </div>

      {/* Top row */}
      <button className="span-two" onClick={() => dispatch({ type: ACTIONS.CLEAR })}>
        AC
      </button>
      <button onClick={() => dispatch({ type: ACTIONS.DELETE_DIGIT })}>
        DEL
      </button>
      <button className="equals-btn span-two" onClick={() => dispatch({ type: ACTIONS.EVALUATE })}>
        =
      </button>


      {/* Row 2 */}
      <DigitButton digit="7" dispatch={dispatch} />
      <DigitButton digit="8" dispatch={dispatch} />
      <DigitButton digit="9" dispatch={dispatch} />
      <OperationButton operation="÷" dispatch={dispatch} className="operation-op" />
      <OperationButton operation="√" dispatch={dispatch} className="unary-op" />

      {/* Row 3 */}
      <DigitButton digit="4" dispatch={dispatch} />
      <DigitButton digit="5" dispatch={dispatch} />
      <DigitButton digit="6" dispatch={dispatch} />
      <OperationButton operation="*" dispatch={dispatch} className="operation-op" />
      <OperationButton operation="x²" dispatch={dispatch} className="unary-op" />

      {/* Row 4 */}
      <DigitButton digit="1" dispatch={dispatch} />
      <DigitButton digit="2" dispatch={dispatch} />
      <DigitButton digit="3" dispatch={dispatch} />
      <OperationButton operation="-" dispatch={dispatch} className="operation-op" />
      <OperationButton operation="1/x" dispatch={dispatch} className="unary-op" />

      {/* Row 5 */}
      <DigitButton digit="0" dispatch={dispatch} />
      <DigitButton digit="." dispatch={dispatch} />
      <OperationButton operation="^" dispatch={dispatch} className="operation-op" />
      <OperationButton operation="+" dispatch={dispatch} className="operation-op" />
      <OperationButton operation="%" dispatch={dispatch} className="unary-op" />
    </div>
  )
}

export default App
