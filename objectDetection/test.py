import asyncio

async def say_hello():
    for i in range(10, 20):
        await asyncio.sleep(1)
        print(i)
    print("task 1 done")

async def say_async():
    for i in range(10):
        await asyncio.sleep(1)
        print(i)
    print("task 2 done")

async def main():
    task2 = asyncio.create_task(say_async())
    await asyncio.sleep(1)
    task1 = asyncio.create_task(say_hello())

    await task1
    print("test")
    await task2
    print("AAA")

asyncio.run(main())
