import { validate as validateClass, ValidationError } from 'class-validator'

export type ValidationResult = {
  isValid: boolean;
  errors: Record<string, string[]>;
}

function formatValidationErrors(errors: ValidationError[]): Record<string, string[]> {
  const errorsByProperty: Record<string, string[]> = {}
  
  const extractMessages = (validationErrors: ValidationError[], parentProperty = '') => {
    for (const error of validationErrors) {
      const propertyPath = parentProperty ? `${parentProperty}.${error.property}` : error.property
      
      if (error.constraints) {
        const constraintValues = Object.values(error.constraints)

        const messages = constraintValues.filter((value): value is string => typeof value === 'string')

        if (messages.length > 0) {
          if (!errorsByProperty[propertyPath]) {
            errorsByProperty[propertyPath] = []
          }

          errorsByProperty[propertyPath].push(...messages)
        }
      }

      if (error.children && error.children.length > 0) {
        extractMessages(error.children, propertyPath)
      }
    }
  }
  
  extractMessages(errors)

  return errorsByProperty
}

async function validate(dto: any, data: any): Promise<ValidationResult> {
  const values = Object.assign(dto, data)

  const validationErrors = await validateClass(values)
  
  return {
    isValid: validationErrors.length === 0,
    errors: formatValidationErrors(validationErrors)
  }
}

export { validate }
