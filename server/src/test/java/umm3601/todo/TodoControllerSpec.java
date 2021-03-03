package umm3601.todo;

import static com.mongodb.client.model.Filters.eq;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.google.common.collect.ImmutableMap;
import com.mockrunner.mock.web.MockHttpServletRequest;
import com.mockrunner.mock.web.MockHttpServletResponse;
import com.mongodb.MongoClientSettings;
import com.mongodb.ServerAddress;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

import org.bson.Document;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import io.javalin.http.BadRequestResponse;
import io.javalin.http.Context;
import io.javalin.http.NotFoundResponse;
import io.javalin.http.util.ContextUtil;
import io.javalin.plugin.json.JavalinJson;

/**
 * Tests the logic of the TodoController
 */
public class TodoControllerSpec {

  MockHttpServletRequest mockReq = new MockHttpServletRequest();
  MockHttpServletResponse mockRes = new MockHttpServletResponse();

  private TodoController todoController;

  private ObjectId frysTodoId;

  static MongoClient mongoClient;
  static MongoDatabase db;

  static ObjectMapper jsonMapper = new ObjectMapper();

  @BeforeAll
  public static void setupAll() {
    String mongoAddr = System.getenv().getOrDefault("MONGO_ADDR", "localhost");

    mongoClient = MongoClients.create(MongoClientSettings.builder()
        .applyToClusterSettings(builder -> builder.hosts(Arrays.asList(new ServerAddress(mongoAddr)))).build());

    db = mongoClient.getDatabase("test");
  }

  @BeforeEach
  public void setupEach() throws IOException {

    // Reset our mock request and response objects
    mockReq.resetAll();
    mockRes.resetAll();

    // Setup database
    MongoCollection<Document> todoDocuments = db.getCollection("todos");
    todoDocuments.drop();
    List<Document> testTodos = new ArrayList<>();
    // Something in VS Code is auto-formatting these code blocks
    // every time that I save, so they do not look pretty.
    testTodos.add(new Document().append("owner", "Fry").append("status", false).append("category", "software design")
        .append("body", "This is a test of the body."));
    testTodos.add(new Document().append("owner", "Blanche").append("status", true).append("category", "groceries")
        .append("body", "This is another test of the body, but with extra text."));
    testTodos.add(new Document().append("owner", "Barry").append("status", true).append("category", "homework")
        .append("body", "Yet another test of the body, but with even more extra text that goes even longer!"));

    frysTodoId = new ObjectId();
    Document fry = new Document().append("_id", frysTodoId).append("owner", "Fry").append("status", true)
        .append("category", "homework").append("body", "This is frysTodoId body text.");

    todoDocuments.insertMany(testTodos);
    todoDocuments.insertOne(fry);

    todoController = new TodoController(db);
  }

  @AfterAll
  public static void teardown() {
    db.drop();
    mongoClient.close();
  }

  @Test
  public void GetAllTodos() throws IOException {

    // Create a fake Javalin context
    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos");
    todoController.getTodos(ctx);

    assertEquals(200, mockRes.getStatus());

    String result = ctx.resultString();
    assertEquals(db.getCollection("todos").countDocuments(), JavalinJson.fromJson(result, Todo[].class).length);
  }

  @Test
  public void GetTodosByOwner() throws IOException {

    // Set the query string to test with
    mockReq.setQueryString("owner=Fry");

    // Create our fake Javalin context
    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos");

    todoController.getTodos(ctx);

    assertEquals(200, mockRes.getStatus());

    String result = ctx.resultString();
    Todo[] resultTodos = JavalinJson.fromJson(result, Todo[].class);

    assertEquals(2, resultTodos.length); // Should have 2
    for (Todo todo : resultTodos) {
      assertEquals("Fry", todo.owner);
    }
  }

  @Test
  public void GetTodosByCategory() throws IOException {

    // Set the query string to test with
    mockReq.setQueryString("category=homework");

    // Create our fake Javalin context
    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos");

    todoController.getTodos(ctx);

    assertEquals(200, mockRes.getStatus());

    String result = ctx.resultString();
    Todo[] resultTodos = JavalinJson.fromJson(result, Todo[].class);

    assertEquals(2, resultTodos.length); // Should have 2
    for (Todo todo : resultTodos) {
      assertEquals("homework", todo.category);
    }
  }

  @Test
  public void GetTodosByStatus() throws IOException {

    // Set the query string to test with
    mockReq.setQueryString("status=true");

    // Create our fake Javalin context
    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos");

    todoController.getTodos(ctx);

    assertEquals(200, mockRes.getStatus());

    String result = ctx.resultString();
    Todo[] resultTodos = JavalinJson.fromJson(result, Todo[].class);

    assertEquals(3, resultTodos.length); // Should have 3
    for (Todo todo : resultTodos) {
      assertEquals(true, todo.status);
    }
  }

  @Test
  public void GetTodosWithIllegalStatus() throws IOException {

    mockReq.setQueryString("status=notABoolean");
    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos");

    // This should throw a 'BadRequestResponse' exception
    assertThrows(BadRequestResponse.class, () -> {
      todoController.getTodos(ctx);
    });
  }

  /**
   * Tests the filtering to see if the given keyword is in the body
   *
   * !Needs to be revised. keyWord isn't defined in Todos.java. Filtering by a
   * !keyWord that is contained in the body might not be defined.
   */
  @Test
  public void GetTodosByKeyWord() throws IOException {

    // Set the query string to test with
    mockReq.setQueryString("keyWord=another");

    // Create our fake Javalin context
    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos");

    todoController.getTodos(ctx);

    assertEquals(200, mockRes.getStatus());

    String result = ctx.resultString();
    Todo[] resultTodos = JavalinJson.fromJson(result, Todo[].class);

    assertEquals(2, resultTodos.length); // Should have 2
    for (Todo todo : resultTodos) {
      assertTrue(todo.body.contains("another"));
    }

  }

  @Test
  public void GetTodosByOwnerAndCategory() throws IOException {

    // Set the query string to test with
    mockReq.setQueryString("owner=Blanche&category=groceries");

    // Create our fake Javalin context
    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos");

    todoController.getTodos(ctx);

    assertEquals(200, mockRes.getStatus());

    String result = ctx.resultString();
    Todo[] resultTodos = JavalinJson.fromJson(result, Todo[].class);

    assertEquals(1, resultTodos.length); // Should have 1
    for (Todo todo : resultTodos) {
      assertEquals("Blanche", todo.owner);
      assertEquals("groceries", todo.category);
    }
  }

  @Test
  public void GetTodosWithExistentId() throws IOException {

    String testID = frysTodoId.toHexString();

    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos/:id", ImmutableMap.of("id", testID));
    todoController.getTodo(ctx);

    assertEquals(200, mockRes.getStatus());

    String result = ctx.resultString();
    Todo resultTodo = JavalinJson.fromJson(result, Todo.class);

    assertEquals(resultTodo._id, frysTodoId.toHexString());
    assertEquals(resultTodo.owner, "Fry");
  }

  /**
   * Testing a todo with a non-existent ID (meaning that the ID is in the correct
   * form, but is not in the database)
   *
   * @throws IOException
   */
  @Test
  public void GetTodosWithNonexistentId() throws IOException {

    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos/:id",
        ImmutableMap.of("id", "588935f5236b2d4ad76a1410"));

    assertThrows(NotFoundResponse.class, () -> {
      todoController.getTodo(ctx);
    });
  }

  /**
   * Testing a todo with a bad ID (meaning that the ID is not in the correct form)
   *
   * @throws IOException
   */
  @Test
  public void GetTodosWithBadId() throws IOException {

    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos/:id", ImmutableMap.of("id", "bad"));

    assertThrows(BadRequestResponse.class, () -> {
      todoController.getTodo(ctx);
    });
  }

  /**
   * Tests the TodoController's ability to add a new todo.
   *
   * @throws IOException
   */
  @Test
  public void AddTodo() throws IOException {

    String testNewTodo = "{" + "\"owner\": \"Barry\"," + "\"status\": false," + "\"category\": \"groceries\","
        + "\"body\": \"Pick up some milk, eggs, and cheese from the store.\"" + "}";

    mockReq.setBodyContent(testNewTodo);
    mockReq.setMethod("POST");

    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos");

    todoController.addNewTodo(ctx);

    assertEquals(201, mockRes.getStatus());

    String result = ctx.resultString();
    String id = jsonMapper.readValue(result, ObjectNode.class).get("id").asText();
    assertNotEquals("", id);
    System.out.println(id);

    assertEquals(1, db.getCollection("todos").countDocuments(eq("_id", new ObjectId(id))));

    // Verify that the todo was added to the database with the correct ID
    Document addedTodo = db.getCollection("todos").find(eq("_id", new ObjectId(id))).first();
    assertNotNull(addedTodo);
    assertEquals("Barry", addedTodo.getString("owner"));
    assertEquals(false, addedTodo.getBoolean("status"));
    assertEquals("groceries", addedTodo.getString("category"));
    assertEquals("Pick up some milk, eggs, and cheese from the store.", addedTodo.getString("body"));
  }

  @Test
  public void AddInvalidStatus() throws IOException {

    String testNewTodo = "{" + "\"owner\": \"Barry\"," + "\"status\": notABoolean,"
        + "\"category\": \"software design\"," + "\"body\": \"this is a test of the body\"" + "}";

    mockReq.setBodyContent(testNewTodo);
    mockReq.setMethod("POST");
    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos");

    assertThrows(BadRequestResponse.class, () -> {
      todoController.addNewTodo(ctx);
    });
  }

  @Test
  public void AddInvalidOwner() throws IOException {

    String testNewTodo = "{" + "\"status\": false," + "\"category\": \"software design\","
        + "\"body\": \"this is a test of the body\"" + "}";

    mockReq.setBodyContent(testNewTodo);
    mockReq.setMethod("POST");
    Context ctx = ContextUtil.init(mockReq, mockRes, "api/todos");

    assertThrows(BadRequestResponse.class, () -> {
      todoController.addNewTodo(ctx);
    });
  }
}
