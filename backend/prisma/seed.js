const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Admin user
  const senhaHash = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@empresa.com' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'admin@empresa.com',
      senha: senhaHash,
      role: 'ADMIN',
    },
  });

  console.log('Admin criado:', admin.email);

  // Funcionários de exemplo
  const funcionarios = [
    {
      nome: 'Ana Silva',
      cpf: '123.456.789-00',
      email: 'ana.silva@empresa.com',
      cargo: 'Desenvolvedora Frontend',
      departamento: 'Tecnologia',
      salarioBase: 8500,
      dataAdmissao: new Date('2022-03-15'),
      valeTransporte: 220,
      valeAlimentacao: 600,
      bonus: 500,
    },
    {
      nome: 'Carlos Mendes',
      cpf: '987.654.321-00',
      email: 'carlos.mendes@empresa.com',
      cargo: 'Analista de RH',
      departamento: 'Recursos Humanos',
      salarioBase: 5500,
      dataAdmissao: new Date('2021-07-01'),
      valeTransporte: 220,
      valeAlimentacao: 600,
      bonus: 0,
    },
    {
      nome: 'Mariana Costa',
      cpf: '456.789.123-00',
      email: 'mariana.costa@empresa.com',
      cargo: 'Gerente de Projetos',
      departamento: 'Operações',
      salarioBase: 12000,
      dataAdmissao: new Date('2020-01-10'),
      valeTransporte: 0,
      valeAlimentacao: 800,
      bonus: 1000,
    },
    {
      nome: 'Pedro Oliveira',
      cpf: '321.654.987-00',
      email: 'pedro.oliveira@empresa.com',
      cargo: 'Designer UX/UI',
      departamento: 'Tecnologia',
      salarioBase: 7000,
      dataAdmissao: new Date('2023-02-20'),
      valeTransporte: 220,
      valeAlimentacao: 600,
      bonus: 300,
    },
    {
      nome: 'Juliana Ferreira',
      cpf: '654.321.098-00',
      email: 'juliana.ferreira@empresa.com',
      cargo: 'Analista Financeiro',
      departamento: 'Financeiro',
      salarioBase: 6800,
      dataAdmissao: new Date('2022-09-05'),
      valeTransporte: 220,
      valeAlimentacao: 600,
      bonus: 200,
    },
  ];

  for (const f of funcionarios) {
    await prisma.funcionario.upsert({
      where: { cpf: f.cpf },
      update: {},
      create: f,
    });
  }

  console.log('Funcionários criados:', funcionarios.length);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
