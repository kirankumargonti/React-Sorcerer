import {FC, memo} from 'react'

interface ButtonProps {
  label: string
  onClick: () => void
  isDisabled?: boolean
  className?: string
}

const Button: FC<ButtonProps> = memo(
  ({label, onClick, isDisabled = false, className = ''}) => {
    const handleClick = () => {
      if (!isDisabled) {
        onClick()
      }
    }

    return (
      <button
        className={`button ${className}}`}
        onClick={handleClick}
        disabled={isDisabled}
      >
        {label}
      </button>
    )
  },
  // Custom comparison function for memoization
  (prevProps, nextProps) =>
    prevProps.label === nextProps.label &&
    prevProps.onClick === nextProps.onClick &&
    prevProps.isDisabled === nextProps.isDisabled
)

export default Button
