p5.disableFriendlyErrors = true; // disables FES

let flock = [];
let numPoints = 100;

exports.run = (audio, midi, assets, utils) => {
  background(0);
  if (flock.length < numPoints && frameCount % 2 === 0) {
    flock.push(new Point());
  }

  for (let point of flock) {
    point.update();
    point.edges();
    point.lines(flock);
    point.display();
  }
};

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
      strokeWeight(map(audio.volume, 0, 1, .25, 5));
      if (d < this.perceptionDistance && d > this.perceptionDistance*.75 && other !== this) {
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
    stroke(map(audio.volume, 0, .5, 50, 255));
  }
}
