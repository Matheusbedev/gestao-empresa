const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const senhaHash = await bcrypt.hash('admin123', 10);

  await prisma.usuario.upsert({
    where: { email: 'admin@empresa.com' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'admin@empresa.com',
      senha: senhaHash,
      role: 'ADMIN',
    },
  });

  const funcionarios = [
    {
      nome: 'Ana Carolina Silva',
      cpf: '123.456.789-09',
      email: 'ana.silva@empresa.com.br',
      telefone: '(43) 99123-4567',
      cargo: 'Desenvolvedora Frontend',
      departamento: 'Tecnologia',
      salarioBase: 8500.00,
      dataAdmissao: new Date('2022-03-15'),
      valeTransporte: 220.00,
      valeAlimentacao: 600.00,
      bonus: 500.00,
    },
    {
      nome: 'Carlos Eduardo Mendes',
      cpf: '987.654.321-00',
      email: 'carlos.mendes@empresa.com.br',
      telefone: '(43) 98765-4321',
      cargo: 'Analista de RH',
      departamento: 'Recursos Humanos',
      salarioBase: 5500.00,
      dataAdmissao: new Date('2021-07-01'),
      valeTransporte: 220.00,
      valeAlimentacao: 600.00,
      bonus: 0,
    },
    {
      nome: 'Mariana Costa Ferreira',
      cpf: '456.789.123-87',
      email: 'mariana.costa@empresa.com.br',
      telefone: '(43) 99456-7890',
      cargo: 'Gerente de Projetos',
      departamento: 'Operações',
      salarioBase: 12000.00,
      dataAdmissao: new Date('2020-01-10'),
      valeTransporte: 0,
      valeAlimentacao: 800.00,
      bonus: 1000.00,
    },
    {
      nome: 'Pedro Henrique Oliveira',
      cpf: '321.654.987-65',
      email: 'pedro.oliveira@empresa.com.br',
      telefone: '(43) 99321-6549',
      cargo: 'Designer UX/UI',
      departamento: 'Tecnologia',
      salarioBase: 7000.00,
      dataAdmissao: new Date('2023-02-20'),
      valeTransporte: 220.00,
      valeAlimentacao: 600.00,
      bonus: 300.00,
    },
    {
      nome: 'Juliana Aparecida Ferreira',
      cpf: '654.321.098-43',
      email: 'juliana.ferreira@empresa.com.br',
      telefone: '(43) 98654-3210',
      cargo: 'Analista Financeiro',
      departamento: 'Financeiro',
      salarioBase: 6800.00,
      dataAdmissao: new Date('2022-09-05'),
      valeTransporte: 220.00,
      valeAlimentacao: 600.00,
      bonus: 200.00,
    },
  ];

  for (const f of funcionarios) {
    await prisma.funcionario.upsert({
      where: { cpf: f.cpf },
      update: {},
      create: f,
    });
  }

  console.log('Banco de dados populado com sucesso.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
