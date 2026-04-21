const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { generateToken } = require('./utils/jwt');
const prisma = new PrismaClient();
async function main() {
  const hash = await bcrypt.hash('admin123', 12);
  let user = await prisma.user.findUnique({where: {email: 'admin@skillbridge.co.in'}});
  if (!user) {
    user = await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@skillbridge.co.in',
        password: hash,
        role: 'ADMIN',
        emailVerified: true
      }
    });
  } else {
    await prisma.user.update({where:{id:user.id},data:{role:'ADMIN'}})
  }
  const token = generateToken(user.id, '7d', 'JWT_SECRET', 'auth', user.tokenVersion || 0);
  console.log('TOKEN=' + token);
}
main().catch(console.error).finally(() => prisma.$disconnect());
