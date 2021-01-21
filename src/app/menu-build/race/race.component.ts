import { Component, OnInit } from '@angular/core';
import {NestedTreeControl} from '@angular/cdk/tree';
import {MatTreeNestedDataSource} from '@angular/material/tree';

interface RaceNode {
  name: string;
  children?: RaceNode[];
}

@Component({
  selector: 'app-race',
  templateUrl: './race.component.html',
  styleUrls: ['./race.component.scss']
})
export class RaceComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
export class TreeNested {
  treeControl = new NestedTreeControl<RaceNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<RaceNode>();
}