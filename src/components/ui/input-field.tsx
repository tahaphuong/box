import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";

export const InputField = ({
  typeInput,
  value,
  setValueFunc,
  label,
}: {
  typeInput: string;
  value: string;
  setValueFunc: (val: string) => void;
  label: string;
}) => {
  return (
    <InputGroup>
      <InputGroupInput
        type={typeInput}
        value={value}
        onChange={(e) => setValueFunc(e.target.value)}
      />
      <InputGroupAddon>
        <Label className="text-gray-700 font-bold">{label}</Label>
      </InputGroupAddon>
    </InputGroup>
  );
};