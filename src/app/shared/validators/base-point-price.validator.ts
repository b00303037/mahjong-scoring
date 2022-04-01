import { AbstractControl, FormControl, ValidationErrors } from '@angular/forms';

export function basePointPriceValidator(
  control: AbstractControl
): ValidationErrors | null {
  const basePrice = (control.get('basePrice') as FormControl).value;
  const pointPrice = (control.get('pointPrice') as FormControl).value;

  const valid =
    basePrice === 0 ||
    (!!basePrice && !!pointPrice && basePrice % pointPrice === 0);

  return valid ? null : { nothingChanged: true };
}
