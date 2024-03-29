var margin = [20, 120, 20, 140],
    width = 600 - margin[1] - margin[3],
    height = 600 - margin[0] - margin[2],
    i = 0,
    duration = 1250,
    root;

var tree = d3.layout.tree().size([height, width]);

var diagonal = d3.svg.diagonal()
    .projection(function(d) { return [d.y, d.x]; });

var vis = d3.select("#body").append("svg:svg")
    .attr("width", "100%")
    .attr("height", height + margin[0] + margin[2])
    .append("svg:g")
    .attr("transform", "translate(" + margin[3] + "," + margin[0] + ")");

d3.json("arf.json", function(json) {
  root = json;
  root.x0 = height / 2;
  root.y0 = 0;

  //initially recursivily load all classes
  build_complete_tree(root);

  root.children.forEach(collapse);
  update(root);
  load_image(root);
});

function update(source) {
  // update the GUI styles

  // Compute the new tree layout.
  var nodes = tree.nodes(root).reverse();

  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.depth * 180; });

  // Update the nodes…
  var node = vis.selectAll("g.node")
      .data(nodes, function(d) { return d.id || (d.id = ++i); });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("svg:g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
      .on("click", function(d) { toggle(d);});

  nodeEnter.append("svg:circle")
      .attr("r", 1e-6)
      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

  nodeEnter.append("svg:text")
      .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
      .attr("dy", ".5em")
      .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
      .text(function(d) { return d.name; })
      .style("fill: rgb(0, 0, 0)", function(d) { return d.free ? 'black' : '#999'; })
      .style("fill-opacity", 1e-6);

  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

  nodeUpdate.select("circle")
      .attr("r", 6)
      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

  nodeUpdate.select("text").style("fill-opacity", 1);

  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
      .remove();

  nodeExit.select("circle")
      .attr("r", 1e-6);

  nodeExit.select("text")
      .style("fill-opacity", 1e-6);

  // Update the links…
  var link = vis.selectAll("path.link")
      .data(tree.links(nodes), function(d) { return d.target.id; });

  // Enter any new links at the parent's previous position.
  link.enter().insert("svg:path", "g")
      .attr("class", "link")
      .attr("d", function(d) {
        var o = {x: source.x0, y: source.y0};
        return diagonal({source: o, target: o});
      })
    .style('stroke',"#AAAAAA")
    .transition()
      .duration(duration)
      .attr("d", diagonal);

  // Transition links to their new position.
  link.transition()
      .duration(duration)
      .attr("d", diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
      .duration(duration)
      .attr("d", function(d) {
        var o = {x: source.x, y: source.y};
        return diagonal({source: o, target: o});
      })
      .remove();

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

// Toggle children.
function toggle(d) {
  if (d.children) { collapse(d); }
  else if(d._children) { expand(d); }
  update(d);
  redPath(d);

  // remove all images
  gallery = document.getElementById("multimedia");
  while (gallery.firstChild) {
    gallery.removeChild(gallery.firstChild);
  }
  load_image(d);
}

function collapse(d) {
  if (d.children) {
    d._children = d.children;
    d._children.forEach(collapse);
    d.children = null;
  }
}

function expand(d) {
  if (d._children) {
    d.children = d._children;
    d._children = null;
  }
  if (d.parent){
    expand(d.parent);
  }
}

function redPath(d){
  //Draw red path-only, from d to root
  h_path = new Set();
  p = d;
  while (p) { h_path.add(p); p=p.parent; }

  //find the target nodes
  var len = 0;
  while (vis.selectAll('path.link')[0][len]){
    x = vis.selectAll('path.link')[0][len];
    if(h_path.has(x['__data__'].target) && h_path.has(x['__data__'].source)){
      x.style.stroke = "red";
    }
    else{
      x.style.stroke = "#AAAAAA";
    }
    len = len + 1;
  }
}

function load_image(d){
  gallery = document.getElementById("multimedia");
  for (img_src in d['images']){
    var img = document.createElement('img');
    img.src = d['images'][img_src];
    img.height="300";
    img.style.paddingBottom = "5px";
    img.style.paddingTop = "5px";
    img.style.paddingRight = "5px";
    img.style.paddingLeft = "5px";
    img.onclick = function(event) {
      expand(d);
      update(d);
      redPath(d);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // remove all images
      gallery = document.getElementById("multimedia");
      while (gallery.firstChild) {
        gallery.removeChild(gallery.firstChild);
      }
      load_image(d);
    }
    gallery.appendChild(img);

  }

  if(d.children)d.children.forEach(load_image);
  if(d._children)d._children.forEach(load_image);

}

function build_complete_tree(p){
  for (x in p.children){
    console.log(p.children[x]);
    build_complete_tree(p.children[x]);
    update(p.children[x]);
  }
}
