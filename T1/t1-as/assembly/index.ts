export function greedy_snake_move(snake: Int32Array, fruit: Int32Array): i32 {
  let headX = snake[0];
  let headY = snake[1];
  let fruitX = fruit[0];
  let fruitY = fruit[1];

  let moveX = fruitX - headX;
  let moveY = fruitY - headY;

  if (moveX > 0 && !isColliding(headX + 1, headY, snake)) {
      return 3;
  }
  if (moveX < 0 && !isColliding(headX - 1, headY, snake)) {
      return 1;
  }
  if (moveY > 0 && !isColliding(headX, headY + 1, snake)) {
      return 0;
  }
  if (moveY < 0 && !isColliding(headX, headY - 1, snake)) {
      return 2;
  }

  if (!isColliding(headX + 1, headY, snake)) return 3;
  if (!isColliding(headX - 1, headY, snake)) return 1;
  if (!isColliding(headX, headY + 1, snake)) return 0;
  if (!isColliding(headX, headY - 1, snake)) return 2;

  return -1;
}

function isColliding(x: i32, y: i32, snake: Int32Array): bool {
  if (x < 1 || x > 8 || y < 1 || y > 8) return true;
  for (let i = 0; i < 6; i += 2) {
      if (snake[i] == x && snake[i + 1] == y) return true;
  }
  return false;
}
