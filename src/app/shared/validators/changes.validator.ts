import {
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
  FormControl,
} from '@angular/forms';

export function changesValidator(data: {
  target?: any;
  keys: Array<string>;
}): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const { target, keys } = data;

    if (target === undefined) {
      return null;
    }

    const hasChanges = keys.some(
      (key) => target[key] !== (control.get(key) as FormControl).value
    );

    return hasChanges ? null : { nothingChanged: true };
  };
}
