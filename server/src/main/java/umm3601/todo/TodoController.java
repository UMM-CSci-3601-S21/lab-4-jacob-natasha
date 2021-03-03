package umm3601.todo;

import static com.mongodb.client.model.Filters.and;
import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Filters.regex;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

import com.google.common.collect.ImmutableMap;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Sorts;

import org.bson.Document;
import org.bson.conversions.Bson;
import org.bson.types.ObjectId;
import org.mongojack.JacksonMongoCollection;

import io.javalin.http.BadRequestResponse;
import io.javalin.http.Context;
import io.javalin.http.NotFoundResponse;

/**
 * Controller that manages requests for info about todos.
 */
public class TodoController {

  private static final String OWNER_KEY = "owner";
  private static final String BODY_KEY = "body";
  private static final String CATEGORY_KEY = "category";
  private static final String STATUS_KEY = "status";

  private final JacksonMongoCollection<Todo> todoCollection;

  /**
   * Construct a controller for todos.
   *
   * @param database
   */
  public TodoController(MongoDatabase database) {
    todoCollection = JacksonMongoCollection.builder().build(database, "todos", Todo.class);
  }

  /**
   * Get a single todo specified by the 'id' parameter in the request.
   *
   * @param ctx a Javalin HTTP context
   */
  public void getTodo(Context ctx) {
    String id = ctx.pathParam("id");
    Todo todo;

    try {
      todo = todoCollection.find(eq("_id", new ObjectId(id))).first();
    } catch (IllegalArgumentException e) {
      throw new BadRequestResponse("The requested todo id wasn't a legal Mongo Object ID.");
    }

    if (todo == null) {
      throw new NotFoundResponse("The requested todo was not found.");
    } else {
      ctx.json(todo);
    }
  }

  /**
   * Get a JSON response with a list of all the todos.
   *
   * @param ctx a Javalin HTTP context
   */
  public void getTodos(Context ctx) {

    List<Bson> filters = new ArrayList<>(); // Start with a blank document

    if (ctx.queryParamMap().containsKey(OWNER_KEY)) {
      filters.add(regex(OWNER_KEY, Pattern.quote(ctx.queryParam(OWNER_KEY)), "i"));
    }

    if (ctx.queryParamMap().containsKey(CATEGORY_KEY)) {
      filters.add(regex(CATEGORY_KEY, Pattern.quote(ctx.queryParam(CATEGORY_KEY)), "i"));
    }

    if (ctx.queryParamMap().containsKey(STATUS_KEY)) {
      boolean targetStatus = ctx.queryParam(STATUS_KEY, Boolean.class).get();
      filters.add(eq(STATUS_KEY, targetStatus));
    }

    // ?Might work when searching the body, but could have unexpected behavior
    if (ctx.queryParamMap().containsKey(BODY_KEY)) {
      filters.add(regex(BODY_KEY, Pattern.quote(ctx.queryParam(BODY_KEY)), "i"));
    }

    String sortBy = ctx.queryParam("sortby", "status");
    String sortOrder = ctx.queryParam("sortorder", "desc");

    ctx.json(todoCollection.find(filters.isEmpty() ? new Document() : and(filters))
        .sort(sortOrder.equals("desc") ? Sorts.descending(sortBy) : Sorts.ascending(sortBy)).into(new ArrayList<>()));
  }

  /**
   * Get a single todo specified by the 'id' parameter in the request.
   *
   * @param ctx a Javalin HTTP context
   */
  public void addNewTodo(Context ctx) {
    // Might need to change todo.status check to Complete or Incomplete
    Todo newTodo = ctx.bodyValidator(Todo.class).check(todo -> todo.owner != null && todo.owner.length() > 0)
        .check(todo -> todo.category != null && todo.category.length() > 0)
        .check(todo -> (todo.status == true) || (todo.status == false))
        .check(todo -> todo.body != null && todo.body.length() > 0).get();

    todoCollection.insertOne(newTodo);
    ctx.status(201);
    ctx.json(ImmutableMap.of("id", newTodo._id));
  }
}
