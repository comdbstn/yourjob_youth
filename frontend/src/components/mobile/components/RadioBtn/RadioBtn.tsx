import "./RadioBtn.css";
interface RadioBtnProps {
  isChecked: boolean;
  setIsChecked: (value: boolean) => void;
}
export default function RadioBtn(props: RadioBtnProps) {
  return (
    <>
      <div
        onClick={() => {
          props.setIsChecked(!props.isChecked);
        }}
        className="RadioBtnContainer"
      >
        <img src="/img/mobile/radio.svg" />
      </div>
    </>
  );
}
