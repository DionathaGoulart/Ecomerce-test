/**
 * Remove todos os caracteres não numéricos
 */
export function cleanNumber(value: string): string {
  return value.replace(/\D/g, '')
}

/**
 * Formata CPF: 000.000.000-00
 */
export function formatCPF(value: string): string {
  const cleaned = cleanNumber(value)
  if (cleaned.length <= 3) return cleaned
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`
  if (cleaned.length <= 9)
    return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`
  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9, 11)}`
}

/**
 * Remove formatação do CPF e retorna apenas números
 */
export function unformatCPF(cpf: string): string {
  return cleanNumber(cpf)
}

/**
 * Formata WhatsApp: (00) 00000-0000 ou +55 (00) 00000-0000
 */
export function formatWhatsApp(value: string): string {
  const cleaned = cleanNumber(value)
  
  // Se começar com 55, é número com código do país
  if (cleaned.startsWith('55') && cleaned.length >= 12) {
    const ddd = cleaned.slice(2, 4)
    const number = cleaned.slice(4)
    
    if (number.length === 8) {
      return `+55 (${ddd}) ${number.slice(0, 4)}-${number.slice(4)}`
    } else if (number.length === 9) {
      return `+55 (${ddd}) ${number.slice(0, 5)}-${number.slice(5)}`
    }
  }
  
  // Se não tem código do país, assume DDD + número
  if (cleaned.length <= 2) return cleaned
  if (cleaned.length <= 6) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`
  if (cleaned.length <= 10)
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`
}

/**
 * Converte WhatsApp formatado para formato de API (55 + DDD + número)
 */
export function formatWhatsAppForAPI(value: string): string {
  const cleaned = cleanNumber(value)
  
  // Se já começa com 55 e tem 12 ou 13 dígitos, retorna como está
  if (cleaned.startsWith('55') && (cleaned.length === 12 || cleaned.length === 13)) {
    return cleaned
  }
  
  // Se não começa com 55, assume que é só DDD + número
  // Adiciona o código 55 na frente
  if (cleaned.length >= 10 && cleaned.length <= 11 && !cleaned.startsWith('55')) {
    return `55${cleaned}`
  }
  
  return cleaned
}

/**
 * Formata CEP: 00000-000
 */
export function formatCEP(value: string): string {
  const cleaned = cleanNumber(value)
  if (cleaned.length <= 5) return cleaned
  return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`
}

/**
 * Remove formatação do CEP
 */
export function unformatCEP(cep: string): string {
  return cleanNumber(cep)
}

/**
 * Capitaliza primeira letra de cada palavra
 */
export function capitalizeWords(value: string): string {
  return value
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
