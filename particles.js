var w = 450,
    h = 300;

var nodes = d3.range(100).map(function() { return {radius: Math.random() * 3 + 4}; }),
    color = d3.scale.category10();

var force = d3.layout.force()
    .gravity(0.15)
    .charge(function(d, i) { return i ? 0 : -950; })
    .nodes(nodes)
    .size([w, h]);

var root = nodes[0];
root.radius = 10;
root.px = 100;
root.py = 100;
root.fixed = false;

var root2 = nodes[1];
root2.radius = 50;
root2.fixed = true;
root2.px = 200;
root2.py = 150;
root2.force = force;
root2.visible=false;

force.start();

var svg = d3.select("#particles").append("svg:svg")
    .attr("width", w)
    .attr("height", h);

svg.selectAll("circle")
    .data(nodes.slice(1))
    .enter().append("svg:circle")
    .attr("r", function(d) { return d.radius - 2; })
    .style("fill", function(d, i) {
        var colors = ["#FFED80FF","#FFED80FF","#FFB6A8FF","#FDFDF2FF"]
        if(d.radius == 50){
            return "transparent";
        }
        return  colors[i % 4];//color(-1);
    })
    .style("opacity","0.9");

force.on("tick", function(e) {
    var q = d3.geom.quadtree(nodes),
        i = 0,
        n = nodes.length;

    while (++i < n) {
        q.visit(collide(nodes[i]));
    }

    svg.selectAll("circle")
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
});

svg.on("mousemove", function() {
    root.fixed = true;
    var p1 = d3.svg.mouse(this);
    root.px = p1[0];
    root.py = p1[1];
    force.resume();
});

function collide(node) {
    var r = node.radius + 16,
        nx1 = node.x - r,
        nx2 = node.x + r,
        ny1 = node.y - r,
        ny2 = node.y + r;
    return function(quad, x1, y1, x2, y2) {
        if (quad.point && (quad.point !== node)) {
            var x = node.x - quad.point.x,
                y = node.y - quad.point.y,
                l = Math.sqrt(x * x + y * y),
                r = node.radius + quad.point.radius;
            if (l < r) {
                l = (l - r) / l * .5;
                node.x -= x *= l;
                node.y -= y *= l;
                quad.point.x += x;
                quad.point.y += y;
            }
        }
        return x1 > nx2
            || x2 < nx1
            || y1 > ny2
            || y2 < ny1;
    };
}