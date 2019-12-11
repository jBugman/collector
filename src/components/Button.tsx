import { css } from 'emotion';
import { ButtonHTMLAttributes } from 'react'; // @types/react

const styles = css`
  background: linear-gradient(180deg, #1f0c04 0%, #bd351e 100%);
  border: 1.5px solid #64472C;
  color: #DFB162;
  border-radius: 5px;
  font-size: 14px;
  :hover {
    color: #F6C66A;
  }
`;

const Button = (props: ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props} className={styles} />;

export default Button;
