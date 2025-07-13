import styles from './counter.module.css';

function createPlusIcon() {
  return (
    <svg
      className={styles.counterIcon}
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      width='50px'>
      <path d='M20.25 11.25h-7.5v-7.5a.75.75 0 0 0-1.5 0v7.5h-7.5a.75.75 0 0 0 0 1.5h7.5v7.5a.75.75 0 0 0 1.5 0v-7.5h7.5a.75.75 0 0 0 0-1.5'></path>
    </svg>
  );
}

function createMinusIcon() {
  return (
    <svg
      className={styles.counterIcon}
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 24 24'
      width='50px'>
      <path d='M20.25 12.75H3.75a.75.75 0 0 1 0-1.5h16.5a.75.75 0 0 1 0 1.5'></path>
    </svg>
  );
}

export default function Counter({
  count,
  minValue,
  onChange,
}: {
  count: number;
  minValue: number;
  onChange: (val: number) => void;
}) {
  return (
    <div className={styles.container}>
      <button onClick={() => onChange(count - 1)} disabled={count === minValue}>
        {createMinusIcon()}
      </button>
      <span>{count}</span>
      <button onClick={() => onChange(count + 1)}>{createPlusIcon()}</button>
    </div>
  );
}
