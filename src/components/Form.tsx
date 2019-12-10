import { createState, createEffect } from 'solid-js';
import { css } from 'emotion';

const textAreaStyles = css`
  min-width: 300px;
  min-height: 400px; 
  background: #0c0b0b;
  border-color: #141414;
  padding: 6px;
  color: inherit;
  outline: none;
  border: 1px solid #141414;
`;

interface Props {
  onTextChange?: (text: string) => void;
}

const Form = ({ onTextChange }: Props) => {
  const [state, setState] = createState({ text: '' });

  const handlePaste = (e: React.ClipboardEvent) => {
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
    console.debug('text', state.text);
    if (typeof onTextChange === 'function') {
      onTextChange(state.text);
    }
  });

  return (
    <textarea
      className={textAreaStyles}
      value={state.text}
      onPaste={handlePaste}
      onInput={handleChange}
    />
  );
};

export default Form;
