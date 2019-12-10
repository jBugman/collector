import { createState, createEffect } from 'solid-js';

interface Props {
  onTextChange?: (text: string) => void;
  className?: string;
}

const Input = ({ onTextChange, className }: Props) => {
  const [state, setState] = createState({ text: '' });

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    if (!e.clipboardData) {
      return;
    }
    const text = e.clipboardData.getData('text');
    setState({ text });
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setState({ text });
  };

  createEffect(() => {
    if (typeof onTextChange === 'function') {
      onTextChange(state.text);
    }
  });

  return (
    <textarea
      className={className}
      placeholder="Paste stats here"
      value={state.text}
      onPaste={handlePaste}
      onInput={handleChange}
    />
  );
};

export default Input;
