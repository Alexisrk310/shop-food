import * as z from "zod"

// Export schemas directly with Spanish messages
export const loginSchema = z.object({
  email: z.string().email({
    message: "Correo electrónico inválido",
  }),
  password: z.string().min(1, {
    message: "La contraseña es requerida",
  }),
})

export const registerSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres",
  }),
  email: z.string().email({
    message: "Correo electrónico inválido",
  }),
  password: z.string().min(8, {
    message: "La contraseña debe tener al menos 8 caracteres",
  }),
})

// Types remain the same, but we need to infer from the return type of the function or just define them manually to avoid circular complexity.
// Actually, z.infer works on the schema instance.
// Let's define base schemas just for type inference or use a helper type.
const baseLoginSchema = z.object({ email: z.string(), password: z.string() })
const baseRegisterSchema = z.object({ name: z.string(), email: z.string(), password: z.string() })

export type LoginValues = z.infer<typeof baseLoginSchema>
export type RegisterValues = z.infer<typeof baseRegisterSchema>
