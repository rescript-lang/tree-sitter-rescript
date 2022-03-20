<div className="b" tabIndex={1} />
// <- operator
// ^ tag
//                              ^ operator
<div className="b" tabIndex={1} />
//       ^ tag.attribute
<Foo.Bar>a <span>b</span> c</Foo.Bar>
// ^ tag
//          ^ tag
<Foo.Bar.Baz.Baz></Foo.Bar.Baz.Baz>
// ^ tag
//        ^ tag
//             ^ tag
//                  ^ tag
<div> React.null </div>
//                ^ tag.delimiter 
