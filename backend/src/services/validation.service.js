const { SECURITY } = require('../constants');

class ValidationService {
  static validatePassword(password) {
    const errors = [];

    if (password.length < SECURITY.PASSWORD_MIN_LENGTH) {
      errors.push(`Senha deve ter no mínimo ${SECURITY.PASSWORD_MIN_LENGTH} caracteres.`);
    }

    if (SECURITY.PASSWORD_REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
      errors.push('Senha deve conter pelo menos uma letra maiúscula.');
    }

    if (SECURITY.PASSWORD_REQUIRE_NUMBERS && !/\d/.test(password)) {
      errors.push('Senha deve conter pelo menos um número.');
    }

    if (SECURITY.PASSWORD_REQUIRE_SPECIAL && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Senha deve conter pelo menos um caractere especial (!@#$%^&*).');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validateCPF(cpf) {
    // Remove caracteres não numéricos
    const cleanCPF = cpf.replace(/\D/g, '');

    if (cleanCPF.length !== 11) return false;

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

    // Calcula primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF[i]) * (10 - i);
    }
    let remainder = sum % 11;
    const firstDigit = remainder < 2 ? 0 : 11 - remainder;

    if (parseInt(cleanCPF[9]) !== firstDigit) return false;

    // Calcula segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF[i]) * (11 - i);
    }
    remainder = sum % 11;
    const secondDigit = remainder < 2 ? 0 : 11 - remainder;

    return parseInt(cleanCPF[10]) === secondDigit;
  }

  static validatePhone(phone) {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length === 11; // (XX) 9XXXX-XXXX
  }

  static validateSalary(salary) {
    return !isNaN(salary) && salary > 0;
  }

  static validateDateRange(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start <= end;
  }
}

module.exports = ValidationService;
