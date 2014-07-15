describe 'Packet', ->

  Given -> @id = '1'
  Given -> @head = some:'head'
  Given -> @body = 'content'
  Given -> @type = 0
  Given -> @uuid = jasmine.createSpyObj 'node-uuid', ['v1']
  Given -> @uuid.v1.andReturn @id
  Given -> @Packet = requireSubject 'lib/packet', {
    'node-uuid': @uuid
  }
  Given -> spyOn(@Packet, 'init').andCallThrough()
  Given -> spyOn(@Packet, 'isPacket').andCallThrough()

  describe '#', ->

    Then -> expect(@Packet() instanceof @Packet).toBe true
    And -> expect(@Packet.init).toHaveBeenCalledWith jasmine.any(@Packet)

  describe '#(pack:Packet)', ->

    Given -> @pack = new @Packet(@head, @body)
    When -> @res = @Packet @pack
    Then -> expect(@res).toBe @pack

  describe '#(...)', ->

    Then -> expect(new @Packet(@head, @body) instanceof @Packet).toBe true
    And -> expect(@Packet.init).toHaveBeenCalledWith jasmine.any(@Packet), @head, @body

  describe '#init (pack:Packet, head:Object, body:Object, id:String, type:Number)', ->

    When -> @res = @Packet.init @Packet(), @head, @body, @id, @type
    Then -> expect(@Packet.isPacket).toHaveBeenCalledWith jasmine.any(@Packet)
    And -> expect(@res.head).toBe @head
    And -> expect(@res.body).toBe @body
    And -> expect(@res.id).toBe @id
    And -> expect(@res.type).toBe @type

  describe '#init (pack:Packet, head:Object, body:Object, id:String)', ->

    When -> @res = @Packet.init @Packet(), @head, @body, @id
    Then -> expect(@res.head).toBe @head
    And -> expect(@res.body).toBe @body
    And -> expect(@res.id).toBe @id

  describe '#init (pack:Packet, head:Object, body:Object)', ->

    When -> @res = @Packet.init @Packet(), @head, @body
    Then -> expect(@res.head).toBe @head
    And -> expect(@res.body).toBe @body

  describe '#init (pack:Packet, data:Object)', ->

    Given -> @data = id: @id, type: @type, head: @head, body: @body
    When -> @res = @Packet.init @Packet(), @data
    Then -> expect(@res.head).toBe @head
    And -> expect(@res.body).toBe @body
    And -> expect(@res.id).toBe @id
    And -> expect(@res.type).toBe @type

  describe '#init (pack:mixed)', ->

    Given -> @fn = => @Packet.init {}
    Then -> expect(@fn).toThrow new TypeError('pack must be a Packet')

  describe '#isPacket (pack:Packet)', ->

    Given -> @pack = @Packet()
    Then -> expect(@Packet.isPacket @pack).toBe true

  describe '#isPacket (pack:object={p:true,head:{},body:null,type:0,id:"1"})', ->

    Given -> @pack = p:true, head:@head, body:@body, type:@type, id:@id
    Then -> expect(@Packet.isPacket @pack).toBe true

  describe '#isPacket (pack:mixed={})', ->

    Given -> @pack = {}
    Then -> expect(@Packet.isPacket @pack).toBe false

  describe '#isPacket (pack:mixed=null)', ->

    Given -> @pack = null
    Then -> expect(@Packet.isPacket @pack).toBe false

  describe '#parse (chunk:String)', ->

    Given -> @chunk = '{"p":true,"id":"1","type":0,"head":{"some":"head"},"body":"636f6e74656e74"}'
    When -> @pack = @Packet.parse @chunk
    Then -> expect(@pack instanceof @Packet).toBe true
    And -> expect(@pack.head).toEqual @head
    And -> expect(@pack.body).toEqual @body
    And -> expect(@pack.id).toEqual @id
    And -> expect(@pack.type).toEqual @type

  describe '#parse (data:Object)', ->

    Given -> @data = p:true, id: @id, type: @type, head: @head, body: @body
    When -> @pack = @Packet.parse @data
    Then -> expect(@pack instanceof @Packet).toBe true
    And -> expect(@pack.head).toEqual @head
    And -> expect(@pack.body).toEqual @body
    And -> expect(@pack.id).toEqual @id
    And -> expect(@pack.type).toEqual @type

  describe '#parse (data:Object)', ->

    Given -> @data = id: @id, type: @type, head: @head, body: @body
    When -> @pack = @Packet.parse @data
    Then -> expect(@pack instanceof @Packet).toBe true
    And -> expect(@pack.head).toEqual @head
    And -> expect(@pack.body).toEqual @body
    And -> expect(@pack.id).toEqual @id
    And -> expect(@pack.type).toEqual @type

  describe '#parse (pack:Packet)', ->

    Given -> @pack = @Packet @head, @body, @id, @type
    When -> @res = @Packet.parse @pack
    Then -> expect(@res).toBe @pack

  describe 'prototype', ->

    Given -> @pack = @Packet @head, @body, @id, @type

    describe '#toString', ->

      When -> @res = @pack.toString()
      Then -> expect(@res).toBe '{"p":true,"id":"1","type":0,"head":{"some":"head"},"body":"636f6e74656e74"}'
