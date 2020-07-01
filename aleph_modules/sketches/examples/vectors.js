let flock = [];
let numPoints = 75;

function setup() {
  while (flock.length < numPoints) {
    flock.push(new Point());
  }
}

function draw() {
  background(0);

  for (let point of flock) {
    point.update();
    point.edges();
    point.lines(flock);
    point.display();
  }
}

class Point {
  constructor() {
    this.position = createVector(random(width), random(height));
    this.velocity = p5.Vector.random2D();
    this.acceleration = createVector();
    this.maxSpeed = 100;
    this.perceptionDistance = random(25, 150);
  }

  edges() {
    if (this.position.x > width) {
      this.position.x = 0;
    } else if (this.position.x < 0) {
      this.position.x = width;
    }

    if (this.position.y > height) {
      this.position.y = 0;
    } else if (this.position.y < 0) {
      this.position.y = height;
    }
  }

  lines(points) {
    for (let other of points) {
      let d = dist(
        this.position.x,
        this.position.y,
        other.position.x,
        other.position.y
      );
      strokeWeight(map(audio.volume, 0, 1, 0.25, 5));
      if (
        d < this.perceptionDistance &&
        d > this.perceptionDistance * 0.25 &&
        other !== this
      ) {
        line(
          this.position.x,
          this.position.y,
          other.position.x,
          other.position.y
        );
      }
    }
  }

  update() {
    this.perceptionDistance = map(audio.volume, 0, 1, 100, 400);
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.velocity.setMag(random(audio.volEased * 100));
    this.position.add(this.velocity);
    this.acceleration.set(0, 0);
  }

  display() {
    stroke(map(audio.volume, 0, 0.5, 50, 255));
  }
}

exports.run = () => {
  utils.render2D(state[path.basename(__filename)], setup, draw);
};
