import { validate as validateClass, ValidationError } from 'class-validator'

export type ValidationResult = {
  isValid: boolean;
  errors: ValidationError[];
  errorMessages: string[];
}

function formatValidationErrors(errors: ValidationError[]): string[] {
  const messages: string[] = []
  
  const extractMessages = (validationErrors: ValidationError[]) => {
    for (const error of validationErrors) {
      if (error.constraints) {
        const constraintValues = Object.values(error.constraints)
        messages.push(...constraintValues.filter((value): value is string => typeof value === 'string'))
      }

      if (error.children && error.children.length > 0) {
        extractMessages(error.children)
      }
    }
  }
  
  extractMessages(errors)

  return messages
}

async function validate(dto: any, data: any): Promise<ValidationResult> {
  const values = Object.assign(dto, data)

  const errors = await validateClass(values)
  
  return {
    isValid: errors.length === 0,
    errors,
    errorMessages: formatValidationErrors(errors)
  }
}

export { validate }
