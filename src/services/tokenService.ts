import { token } from "../models/token.js";

async function save(employeeId: number, refreshToken: string) {
  const currentToken: any = await token.findOne({
    where: { employeeId },
  });

  if (currentToken) {
    currentToken.refreshToken = refreshToken;

    await currentToken.save();

    return;
  }

  await token.create({ employeeId, refreshToken });
}

function getByToken(refreshToken: string) {
  return token.findOne({
    where: { refreshToken },
  });
}

function remove(employeeId: number) {
  return token.destroy({
    where: { employeeId },
  });
}

export const tokenService = {
  getByToken,
  save,
  remove,
}