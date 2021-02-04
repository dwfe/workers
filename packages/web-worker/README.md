Interaction between threads can be unified in this way:

![](./docs/workers-ContextSide-concept.png 'ContextSide concept')

Converter variants:

1. [Structural cloning](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Structured_clone_algorithm) ([Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) default behavior)
2. [Circular buffer](https://en.wikipedia.org/wiki/Circular_buffer)
3. Transferable

