let snakeScores: Int32Array = new Int32Array(2);
let lastFoodPositions: Int32Array = new Int32Array(10);

// 检查是否碰撞
export function isColliding(x: i32, y: i32, n: i32, snake: Int32Array, snake_num: i32, other_snakes: Int32Array): bool {
  if (x < 1 || x > n || y < 1 || y > n) return true;
  for (let i = 0; i < 6; i += 2) {
    if (snake[i] == x && snake[i + 1] == y) return true;
  }
  for (let i = 0; i < snake_num * 8; i += 2) {
    if (i == 6 || i == 7 || i == 14 || i == 15 || i == 22 || i == 23) continue;
    if (other_snakes[i] == x && other_snakes[i + 1] == y) return true;
  }
  return false;
}

// 更新上回合果子的位置
export function update_last_food_positions(food_num: i32, foods: Int32Array): void {
  for (let i = 0; i < food_num * 2; i++) {
    lastFoodPositions[i] = foods[i];
  }
  for (let i = food_num * 2; i < 10; i++) {
    lastFoodPositions[i] = -1; // 处理剩余位置
  }
}

// 找到消失的果子
export function find_eaten_foods(food_num: i32, foods: Int32Array): Int32Array {
  let eatenFoods: Int32Array = new Int32Array(10);
  let eatenCount: i32 = 0;

  for (let i = 0; i < 10; i += 2) {
    let lastX = lastFoodPositions[i];
    let lastY = lastFoodPositions[i + 1];

    if (lastX == -1 || lastY == -1) continue; // 忽略无效位置

    let stillExists: bool = false;
    for (let j = 0; j < food_num * 2; j += 2) {
      if (foods[j] == lastX && foods[j + 1] == lastY) {
        stillExists = true;
        break;
      }
    }

    if (!stillExists) {
      eatenFoods[eatenCount * 2] = lastX;
      eatenFoods[eatenCount * 2 + 1] = lastY;
      eatenCount++;
    }
  }

  return eatenFoods;
}

export function greedy_snake_step(
  n: i32,
  snake: Int32Array,
  snake_num: i32,
  other_snakes: Int32Array,
  food_num: i32,
  foods: Int32Array,
  round: i32
): i32 {
  if (n == 5) {
    return greedy_snake_step_for_1v1(n, snake, snake_num, other_snakes, food_num, foods, round);
  } else {
    return greedy_snake_step_total(n, snake, snake_num, other_snakes, food_num, foods, round);
  }
}

// 贪吃蛇决策函数
export function greedy_snake_step_for_1v1(
  n: i32,
  snake: Int32Array,
  snake_num: i32,
  other_snakes: Int32Array,
  food_num: i32,
  foods: Int32Array,
  round: i32
): i32 {

  let headX = snake[0], headY = snake[1];

  let directions = new Int32Array(8); // 右、左、上、下
  directions.set([0, 1, -1, 0, 0, -1, 1, 0]); // 设置方向


  // 找到消失的果子
  let eatenFoods: Int32Array = find_eaten_foods(food_num, foods);

  // 更新蛇蛇的分数
  for (let i = 0; i < eatenFoods.length; i += 2) {
    let foodX = eatenFoods[i];
    let foodY = eatenFoods[i + 1];

    for (let j = 0; j < snake_num; j++) {
      let snakeHeadX = other_snakes[j], snakeHeadY = other_snakes[j+1];

      // 检查蛇是否吃到了果子
      // 自己
      if (snake[0] == foodX && snake[1] == foodY) snakeScores[0] += 1;
      // 别人
      if (snakeHeadX == foodX && snakeHeadY == foodY) {
        // 更新分数
        snakeScores[j+1] += 1;
      }
    }
  }
  // console.log("score0: "+ snakeScores[0].toString());
  // console.log("score1: "+ snakeScores[1].toString());
  // 更新果子的位置
  update_last_food_positions(food_num, foods);


  let bestMove: i32 = -1;
  let minDist: i32 = 2147483647; // 替换 Infinity
  // 寻找最近的果子并判断是否有争夺
  for (let i = 0; i < 4; i++) {
    let newX = headX + directions[i * 2];
    let newY = headY + directions[i * 2 + 1];

    if (!isColliding(newX, newY, n, snake, snake_num, other_snakes)) {
      for (let j = 0; j < food_num * 2; j += 2) {
        let foodX = foods[j];
        let foodY = foods[j + 1];
        let dist = abs(foodX - newX) + abs(foodY - newY); // 替换 Math.abs

        // 找到最近的果子
        if (dist < minDist) {
          minDist = dist;
          bestMove = i;

          // 判断是否有其他蛇也会吃到这个果子
          let collision = false;
          let enemyIndex: i32 = -1;

          //检查下一步周围是否有蛇头
          // 检查下一步周围的四个方向
          for (let k = 0; k < snake_num; k++) {
            let enemyX = other_snakes[k * 8], enemyY = other_snakes[k * 8 + 1];

            // 检查四个方向（上下左右）
            for (let d = 0; d < 4; d++) {
              let enemyNewX = enemyX + directions[d * 2];
              let enemyNewY = enemyY + directions[d * 2 + 1];

              // 如果在周围有蛇头，就不吃这个果子
              if (enemyNewX == newX && enemyNewY == newY) {
                collision = true;
                enemyIndex = k;
                break;
              }
            }
            if (collision) break;
          }


          // 如果争夺果子，根据分数判断
          if (collision) {
            let myScore = snakeScores[0];
            let enemyScore = snakeScores[enemyIndex + 1];

            // 判断是否要拼命
            if (myScore > enemyScore) {
              return i; // 冲刺！
            } else {
              // 避让
              for (let der = 0; der < 4; der++) {
                let newX = headX + directions[der * 2];
                let newY = headY + directions[der * 2 + 1];

                if (!isColliding(newX, newY, n, snake, snake_num, other_snakes) && der != i) {
                  bestMove = der;
                }
              }
            }
          }
        }
      }
    }
  }

  // 如果没有找到果子，走最近的可行方向
  if (bestMove !== -1) return bestMove;

  for (let i = 0; i < 4; i++) {
    let newX = headX + directions[i * 2];
    let newY = headY + directions[i * 2 + 1];

    if (!isColliding(newX, newY, n, snake, snake_num, other_snakes)) return i;
  }

  return 0; // 无路可走，默认方向
}


//彻底的贪心（4v4）
export function greedy_snake_step_total(
  n: i32,
  snake: Int32Array,
  snake_num: i32,
  other_snakes: Int32Array,
  food_num: i32,
  foods: Int32Array,
  round: i32
): i32 {
  let headX = snake[0];
  let headY = snake[1];

  let directions = new Int32Array(8);  // 创建一个长度为 8 的 Int32Array
  directions.set([0, 1, -1, 0, 0, -1, 1, 0]); // 设置方向

  let bestMove: i32 = -1;
  let minDist: i32 = 2147483647; // 替换 Infinity

  for (let i = 0; i < 4; i++) {
    let newX = headX + directions[i * 2];
    let newY = headY + directions[i * 2 + 1];

    if (!isColliding(newX, newY, n, snake, snake_num, other_snakes)) {
      for (let j = 0; j < food_num * 2; j += 2) {
        let foodX = foods[j];
        let foodY = foods[j + 1];
        let dist = abs(foodX - newX) + abs(foodY - newY); // 替换 Math.abs

        if (dist < minDist) {
          minDist = dist;
          bestMove = i;
        }
      }
    }
  }

  if (bestMove !== -1) return bestMove;

  for (let i = 0; i < 4; i++) {
    let newX = headX + directions[i * 2];
    let newY = headY + directions[i * 2 + 1];

    if (!isColliding(newX, newY, n, snake, snake_num, other_snakes)) return i;
  }

  return 0;
}