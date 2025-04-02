export function greedySnakeMoveBarriers(
  snake: Int32Array,
  fruit: Int32Array,
  barriers: Int32Array
): i32 {
  let headX = snake[0];
  let headY = snake[1];
  let fruitX = fruit[0];
  let fruitY = fruit[1];

  if (!isReachable(headX, headY, fruitX, fruitY, snake, barriers)) {
    return -1;
  }

  return bfsMove(headX, headY, fruitX, fruitY, snake, barriers);
}

function bfsMove(
  startX: i32, startY: i32,
  targetX: i32, targetY: i32,
  snake: Int32Array, barriers: Int32Array
): i32 {
  let queue: Array<Int32Array> = [];
  let startPoint = new Int32Array(3);
  startPoint[0] = startX;
  startPoint[1] = startY;
  startPoint[2] = -1;
  queue.push(startPoint);

  let visited: Map<string, boolean> = new Map();
  visited.set(`${startX},${startY}`, true);

  let directions: Int32Array[] = [
    new Int32Array(3), // 上
    new Int32Array(3), // 左
    new Int32Array(3), // 下
    new Int32Array(3)  // 右
  ];
  directions[0][0] = 0;  directions[0][1] = 1;  directions[0][2] = 0;
  directions[1][0] = -1; directions[1][1] = 0;  directions[1][2] = 1;
  directions[2][0] = 0;  directions[2][1] = -1; directions[2][2] = 2;
  directions[3][0] = 1;  directions[3][1] = 0;  directions[3][2] = 3;

  while (queue.length > 0) {
    let point = queue.shift();
    if (!point) continue;
    let x = point[0];
    let y = point[1];
    let direction = point[2];

    if (x === targetX && y === targetY) return direction;

    for (let i = 0; i < 4; i++) {
      let newX = x + directions[i][0];
      let newY = y + directions[i][1];
      let newDir = directions[i][2];

      if (!visited.has(`${newX},${newY}`) && !isColliding(newX, newY, snake, barriers)) {
        visited.set(`${newX},${newY}`, true);
        let newPoint = new Int32Array(3);
        newPoint[0] = newX;
        newPoint[1] = newY;
        newPoint[2] = direction === -1 ? newDir : direction;
        queue.push(newPoint);
      }
    }
  }

  return -1;
}

function isColliding(x: i32, y: i32, snake: Int32Array, barriers: Int32Array): bool {
  if (x < 1 || x > 8 || y < 1 || y > 8) return true;

  for (let i = 0; i < 6; i += 2) {
    if (snake[i] == x && snake[i + 1] == y) return true;
  }

  for (let i = 0; i < barriers.length; i += 2) {
    if (barriers[i] == x && barriers[i + 1] == y) return true;
  }

  return false;
}

function isReachable(
  startX: i32, startY: i32,
  targetX: i32, targetY: i32,
  snake: Int32Array, barriers: Int32Array
): bool {
  let queue: Array<Int32Array> = [];
  let startPoint = new Int32Array(2);
  startPoint[0] = startX;
  startPoint[1] = startY;
  queue.push(startPoint);

  let visited: Map<string, boolean> = new Map();
  visited.set(`${startX},${startY}`, true);

  let directions: Int32Array[] = [
    new Int32Array(2), // 上
    new Int32Array(2), // 左
    new Int32Array(2), // 下
    new Int32Array(2)  // 右
  ];
  directions[0][0] = 0;  directions[0][1] = 1;
  directions[1][0] = -1; directions[1][1] = 0;
  directions[2][0] = 0;  directions[2][1] = -1;
  directions[3][0] = 1;  directions[3][1] = 0;

  while (queue.length > 0) {
    let point = queue.shift();
    if (!point) continue;
    let x = point[0];
    let y = point[1];

    if (x === targetX && y === targetY) return true;

    for (let i = 0; i < 4; i++) {
      let newX = x + directions[i][0];
      let newY = y + directions[i][1];

      if (!visited.has(`${newX},${newY}`) && !isColliding(newX, newY, snake, barriers)) {
        visited.set(`${newX},${newY}`, true);
        let newPoint = new Int32Array(2);
        newPoint[0] = newX;
        newPoint[1] = newY;
        queue.push(newPoint);
      }
    }
  }

  return false;
}
