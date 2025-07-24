// utils/dateFormatter.js

const months = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
];

/**
 * Formata uma data no formato "14 de junho de 2025 às 23:53"
 * @param {Date|string} date - Data a ser formatada (pode ser um objeto Date ou string ISO)
 * @returns {string} Data formatada
 */
export function formatFullDate(date) {
  // Se for string, converte para Date
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // Verifica se a data é válida
  if (isNaN(dateObj.getTime())) {
    return 'Data inválida';
  }

  const day = dateObj.getDate();
  const month = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  const hours = String(dateObj.getHours()).padStart(2, '0');
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');

  return `${day} de ${month} de ${year} às ${hours}:${minutes}`;
}