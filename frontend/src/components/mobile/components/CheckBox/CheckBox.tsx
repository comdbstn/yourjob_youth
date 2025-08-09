import "./CheckBox.css";
interface CheckBoxProps {
  isChecked: boolean;
  setIsChecked: (value: boolean) => void;
}
export default function CheckBox(props: CheckBoxProps) {
  return (
    <>
      <div
        onClick={() => {
          props.setIsChecked(!props.isChecked);
        }}
        className="checkBoxContainer"
      >
        {props.isChecked ? <img src="/img/mobile/checked.png" /> : <div className="noneChecked"></div>}
      </div>
    </>
  );
}
